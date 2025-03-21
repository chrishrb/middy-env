import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Context as LambdaContext } from 'aws-lambda';

const defaults = {
  setToContext: true,
};

export type EnvType<T> = {
  path: string & { __returnType?: T };
  type: 'string' | 'number' | 'boolean';
};

export const envVar = <T>(
  path: string,
  type: 'string' | 'number' | 'boolean' = 'string',
): EnvType<T> => {
  return { path, type };
};

interface IOptions<T> {
  variables: T;
  setToContext?: boolean;
}

const castEnvVar = (
  value: string,
  type: 'string' | 'number' | 'boolean',
): string | number | boolean => {
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value.toLowerCase() === 'true' || value === '1';
    default:
      return value;
  }
};

const getEnvVar = <T>(
  key: string,
  type: 'string' | 'number' | 'boolean',
): T => {
  const value = process.env[key];

  if (!value) {
    throw new ReferenceError(`Environment variable ${key} is missing`);
  }

  return castEnvVar(value, type) as T;
};

const getEnvVars = <T extends Record<string, EnvType<unknown>>>(
  variables: T,
): { [K in keyof T]: T[K] extends EnvType<infer R> ? R : never } => {
  const values: Partial<{
    [K in keyof T]: T[K] extends EnvType<infer R> ? R : never;
  }> = {};

  for (const key in variables) {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      const { path, type } = variables[key];
      values[key] = getEnvVar(path, type);
    }
  }

  return values as {
    [K in keyof T]: T[K] extends EnvType<infer R> ? R : never;
  };
};

const envMiddleware = <T extends Record<string, EnvType<unknown>>>(
  opts: IOptions<T>,
): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Error,
  Context<T>
> => {
  const options: IOptions<T> = { ...defaults, ...opts };

  const before: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = async (request): Promise<void> => {
    const envVariables = getEnvVars(options.variables);

    if (options.setToContext) {
      const data = { envVariables };
      request.context = { ...request.context, ...data };
    }
  };

  return {
    before,
  };
};

export type Context<T> = LambdaContext & {
  envVariables: { [K in keyof T]: T[K] extends EnvType<infer R> ? R : never };
};

export default envMiddleware;
