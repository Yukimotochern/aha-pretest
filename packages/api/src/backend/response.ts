import { z } from 'zod';
import {
  ResponseErrorWithDataSchema,
  ErrorResponseCreator,
} from './response.types';

export const response = <dataSchema extends z.ZodTypeAny>(data: dataSchema) =>
  new Response(
    z.object({
      status: z.literal('ok'),
      data,
    })
  );
export class Response<ResponseSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  constructor(public schema: ResponseSchema) {}
  /* Add more error to a response schema with fluent api */
  error: <
    Code extends string,
    Message extends string,
    ErrorOptions extends ResponseErrorWithDataSchema<Code, Message>
  >(
    errorOptions: Readonly<ErrorOptions>
  ) => Response<
    z.ZodUnion<
      [
        ResponseSchema,
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
    return new Response(
      this.schema.or(
        z.object({
          status: z.literal('error'),
          code: z.literal(code),
          message: z.literal(message),
          ...(errorData && { errorData }),
        })
      )
      // Conditional return type can not be inferred, disable eslint
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
  };
}

export const okResponse = <Data>(data: Data) =>
  ({
    status: 'ok',
    data,
  } as const);

export const errorResponse: ErrorResponseCreator = (error) => {
  const { code, message, errorData } = error;
  return {
    status: 'error',
    code,
    message,
    ...(errorData && { errorData }),
    // Conditional return type can not be inferred, disable eslint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
};
