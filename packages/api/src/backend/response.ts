import { z } from 'zod';
import {
  ErrorResponseWithDataSchema,
  ErrorResponseCreator,
} from './response.types';

export const outputResponseSchema = <dataSchema extends z.ZodTypeAny>(
  data: dataSchema
) =>
  new OutputResponse(
    z.object({
      status: z.literal('ok'),
      data,
    })
  );
export class OutputResponse<
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
  ) => OutputResponse<
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
    return new OutputResponse(
      this.schema.or(
        z.object({
          status: z.literal('error'),
          code: z.literal(code),
          message: z.literal(message),
          ...(errorData && { errorData }),
        })
      )
    ) as never; // prevent type error
  };
}

export const ok = <Data>(data: Data) =>
  ({
    status: 'ok',
    data,
  } as const);

export const error: ErrorResponseCreator = (error) => {
  const { code, message, errorData } = error;
  return {
    status: 'error',
    code,
    message,
    ...(errorData && { errorData }),
  } as never; // prevent type error
};

export const statusLayerResponse = {
  ok,
  error,
};
