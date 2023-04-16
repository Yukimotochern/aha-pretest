import { ZodTypeAny } from 'zod';

export interface BaseErrorResponse<
  Code extends string,
  Message extends string
> {
  code: Code;
  message: Message;
}

export interface ErrorResponseWithDataSchema<
  Code extends string,
  Message extends string
> extends BaseErrorResponse<Code, Message> {
  errorData?: ZodTypeAny;
}

export interface ErrorResponseWithData<
  ErrorType,
  Code extends string,
  Message extends string
> extends BaseErrorResponse<Code, Message> {
  errorData?: ErrorType;
}

export type ErrorResponseCreator = <
  ErrorType,
  Code extends string,
  Message extends string,
  errorCreatorOptionType extends ErrorResponseWithData<ErrorType, Code, Message>
>(
  error: Readonly<errorCreatorOptionType>
) => errorCreatorOptionType & { status: 'error' };
