import middy from '@middy/core';
import { describe, expect, test } from 'vitest';
import { envVar } from './main';
import env from './main';
import { Context as LambdaContext } from 'aws-lambda';

const event = {};
const context = {
  getRemainingTimeInMillis: () => 1000,
} as unknown as LambdaContext;

describe('middy-env', () => {
  test('it should set env variable to context', async () => {
    process.env.MY_EXAMPLE_VARIABLE = 'exampleValue';

    const handler = middy(() => {});

    handler
      .use(
        env({
          variables: {
            myExampleVariable: envVar<string>('MY_EXAMPLE_VARIABLE'),
          },
          setToContext: true,
        }),
      )
      .before(async (request) => {
        expect(request.context.envVariables).not.toBeNull();
        expect(request.context.envVariables.myExampleVariable).toBe(
          'exampleValue',
        );
        expect(request.context.envVariables.myExampleVariable).toBeTypeOf(
          'string',
        );
      });

    await handler(event, context);
  });

  test.each([
    { envValue: 'true', expected: true },
    { envValue: 'false', expected: false },
    { envValue: 'TRUE', expected: true },
    { envValue: 'FALSE', expected: false },
    { envValue: '1', expected: true },
    { envValue: '0', expected: false },
  ])(
    'it should set boolean env variable to context for envValue: $envValue',
    async ({ envValue, expected }) => {
      process.env.MY_EXAMPLE_VARIABLE = envValue;

      const handler = middy(() => {});

      handler
        .use(
          env({
            variables: {
              myExampleVariable: envVar<boolean>(
                'MY_EXAMPLE_VARIABLE',
                'boolean',
              ),
            },
            setToContext: true,
          }),
        )
        .before(async (request) => {
          expect(request.context.envVariables).not.toBeNull();
          expect(request.context.envVariables.myExampleVariable).toBeTypeOf(
            'boolean',
          );
          expect(request.context.envVariables.myExampleVariable).toBe(expected);
        });

      await handler(event, context);
    },
  );

  test('it should set int env variable to context', async () => {
    process.env.MY_EXAMPLE_VARIABLE = '0';

    const handler = middy(() => {});

    handler
      .use(
        env({
          variables: {
            myExampleVariable: envVar<number>('MY_EXAMPLE_VARIABLE', 'number'),
          },
          setToContext: true,
        }),
      )
      .before(async (request) => {
        expect(request.context.envVariables).not.toBeNull();
        expect(request.context.envVariables.myExampleVariable).toBeTypeOf(
          'number',
        );
        expect(request.context.envVariables.myExampleVariable).toBe(0);
      });

    await handler(event, context);
  });

  test('it should set float env variable to context', async () => {
    process.env.MY_EXAMPLE_VARIABLE = '1.2';

    const handler = middy(() => {});

    handler
      .use(
        env({
          variables: {
            myExampleVariable: envVar<number>('MY_EXAMPLE_VARIABLE', 'number'),
          },
          setToContext: true,
        }),
      )
      .before(async (request) => {
        expect(request.context.envVariables).not.toBeNull();
        expect(request.context.envVariables.myExampleVariable).toBeTypeOf(
          'number',
        );
        expect(request.context.envVariables.myExampleVariable).toBe(1.2);
      });

    await handler(event, context);
  });

  test('it should throw error if env variable not set', async () => {
    process.env.MY_EXAMPLE_VARIABLE = '';

    const handler = middy(() => {});

    handler.use(
      env({
        variables: {
          myExampleVariable: envVar<boolean>('MY_EXAMPLE_VARIABLE'),
        },
        setToContext: true,
      }),
    );

    await expect(handler(event, context)).rejects.toBeInstanceOf(
      ReferenceError,
    );
  });

  test('it should set env variable not to context', async () => {
    process.env.MY_EXAMPLE_VARIABLE = 'exampleValue';

    const handler = middy(() => {});

    handler
      .use(
        env({
          variables: {
            myExampleVariable: envVar<string>('MY_EXAMPLE_VARIABLE'),
          },
          setToContext: false,
        }),
      )
      .before(async (request) => {
        expect(request.context.envVariables).toBeUndefined();
      });

    await handler(event, context);
  });
});
