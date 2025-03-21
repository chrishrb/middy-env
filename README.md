# middy-env

Simple environment variable middleware for the [middy](https://github.com/middyjs/middy) framework. Full typescript support.

## Getting started

```bash
pnpm install @chrishrb/middy-env
```

## Options

- `setToContext` (boolean) (optional): This will assign the parsed values to the context object of the function handler rather than to process.env. Defaults to true.
- `variables` (object) (required): Map of environment variables to parse, where the key is the destination.

## Supported Types

- `string`
- `boolean`
- `number`

## Usage

```typescript
import middy from '@middy/core';
import env, { envVar } from '@chrishrb/middy-env';

const handler = middy(() => {});

handler
  .use(
    env({
      variables: {
        myExampleVariable: envVar<boolean>('MY_EXAMPLE_VARIABLE', 'boolean'),
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
```
