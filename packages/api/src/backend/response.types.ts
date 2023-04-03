import { ZodTypeAny } from 'zod';

export interface BaseResponseError<
  Code extends string,
  Message extends string
> {
  code: Code;
  message: Message;
}

export interface ResponseErrorWithDataSchema<
  Code extends string,
  Message extends string
> extends BaseResponseError<Code, Message> {
  errorData?: ZodTypeAny;
}

export interface ResponseErrorWithData<
  ErrorType,
  Code extends string,
  Message extends string
> extends BaseResponseError<Code, Message> {
  errorData?: ErrorType;
}

export type ErrorResponseCreator = <
  ErrorType,
  Code extends string,
  Message extends string,
  errorCreatorOptionType extends ResponseErrorWithData<ErrorType, Code, Message>
>(
  error: Readonly<errorCreatorOptionType>
) => errorCreatorOptionType & { status: 'error' };
