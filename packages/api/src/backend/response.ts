import { z } from 'zod';
import {
  ErrorResponseWithDataSchema,
  ErrorResponseCreator,
} from './response.types';

export const outputSchema = <dataSchema extends z.ZodTypeAny>(
  data: dataSchema
) =>
  new OutputSchema(
    z.object({
      status: z.literal('ok'),
      data,
    })
  );
export class OutputSchema<
  OutputResponseSchema extends z.ZodTypeAny = z.ZodTypeAny
> {
  constructor(public schema: OutputResponseSchema) {}

  /* Add more error to a response schema with fluent api */
  error: <
    Code extends string,
    Message extends string,
    ErrorOptions extends ErrorResponseWithDataSchema<Code, Message>
  >(
    errorOptions: Readonly<ErrorOptions>
  ) => OutputSchema<
    z.ZodUnion<
      [
        OutputResponseSchema,
        z.ZodObject<
          unknown extends ErrorOptions['errorData']
            ? {
                status: z.ZodLiteral<'error'>;
                code: z.ZodLiteral<ErrorOptions['code']>;
                message: z.ZodLiteral<ErrorOptions['message']>;
              }
            : {
                status: z.ZodLiteral<'error'>;
                code: z.ZodLiteral<ErrorOptions['code']>;
                message: z.ZodLiteral<ErrorOptions['message']>;
                errorData: NonNullable<ErrorOptions['errorData']>;
              }
        >
      ]
    >
  > = (errorOptions) => {
    const { code, message, errorData } = errorOptions;
    return new OutputSchema(
      this.schema.or(
        z.object({
          status: z.literal('error'),
          code: z.literal(code),
          message: z.literal(message),
          ...(errorData && { errorData }),
        })
      )
    ) as never;
  };
}

export function ok(): { status: 'ok' };
export function ok<Data>(data: Data): { status: 'ok'; data: Data };
export function ok<Data>(data?: Data) {
  if (data === undefined) {
    return {
      status: 'ok',
    };
  }
  return {
    status: 'ok',
    data,
  };
}

export const error: ErrorResponseCreator = (error) => {
  const { code, message, errorData } = error;
  return {
    status: 'error',
    code,
    message,
    ...(errorData && { errorData }),
  } as never;
};

export const statusLayerResponse = {
  ok,
  error,
};
