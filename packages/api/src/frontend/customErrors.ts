/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRPCClientError } from '@trpc/client';
import { AnyRouter } from '@trpc/server';
import { ZodError } from 'zod';

export class BaseCustomError extends Error {
  public override name = 'BaseCustomError';
  constructor(
    public override message: string = 'Unknown Error',
    public statusCode: number = 400
  ) {
    super(message);
    // restore prototype chain
    this.name = new.target.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, new.target);
    }
    (
      this as unknown as {
        prototype: unknown;
      }
    ).prototype = Object.create(new.target.prototype);
    (
      this as unknown as {
        constructor: unknown;
      }
    ).constructor = this;
  }
}

export class InternalClientError extends BaseCustomError {
  public override name = 'InternalClientError' as const;
}

export class InvalidInputError<T = any> extends BaseCustomError {
  public override name = 'InvalidInputError' as const;
  constructor(msg: string, public zodError: ZodError<T>) {
    super(msg);
  }
}

export class InvalidOutputError<T = any> extends BaseCustomError {
  public override name = 'InvalidOutputError' as const;
  constructor(msg: string, public zodError: ZodError<T>) {
    super(msg);
  }
}

export class StatusLayerError<ErrorInStatusLayer> extends BaseCustomError {
  public override name = 'StatusLayerError' as const;
  constructor(
    msg: string,
    public error: ErrorInStatusLayer,
    public path: string
  ) {
    super(msg);
  }
}

export const customErrors = [
  InternalClientError,
  InvalidInputError,
  InvalidOutputError,
  StatusLayerError,
] as const;
export type CustomErrors = InstanceType<(typeof customErrors)[number]>;
export type CustomErrorNames = CustomErrors['name'];
export function isCustomError(err: unknown): err is CustomErrors {
  return err instanceof BaseCustomError;
}
export const wrapWithTRPCClientError = (customError: CustomErrors) =>
  new TRPCClientError<AnyRouter>(customError.message, {
    cause: customError,
  });
