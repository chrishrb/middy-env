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

// or export it from outside
process.env.MY_EXAMPLE_VARIABLE = 'myValue';

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
    // Full typescript support here
    console.log(request.context.envVariables.myExampleVariable);
  });

await handler(event, context);
```
