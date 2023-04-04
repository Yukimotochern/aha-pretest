import { get as lodashGet } from 'lodash';
import { z } from 'zod';
import { Get } from 'type-fest';
import {
  InvalidInputError,
  InvalidOutputError,
  StatusLayerError,
  API,
} from '@aha/api';
import { TRPCClientError } from '@trpc/client';
import { ApiProcedurePaths } from './handleError.types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const voidFunc = () => {};

const defaultHandleOption = {
  shouldRunCallbackIfAlreadyHandled: false,
  shouldSetHandled: true,
};

type HandleOption = Partial<typeof defaultHandleOption>;

export const handleError = (err: unknown) => new ErrorHandler(err);

class ErrorHandler {
  public handled = false;
  constructor(public err: unknown) {}

  private runCallbackBasedOnHandleOption(
    cb = voidFunc,
    handleOption: HandleOption = defaultHandleOption
  ) {
    const { shouldRunCallbackIfAlreadyHandled, shouldSetHandled } = {
      ...defaultHandleOption,
      ...handleOption,
    };
    const shouldRunCallback =
      !this.handled || shouldRunCallbackIfAlreadyHandled;
    if (shouldRunCallback) {
      cb();
      if (shouldSetHandled) this.handled = true;
    }
    return this;
  }

  onOtherCondition(
    cb = voidFunc,
    handleOption: HandleOption = defaultHandleOption
  ) {
    return this.runCallbackBasedOnHandleOption(cb, handleOption);
  }

  onErrorMessage(
    msg: string,
    cb = voidFunc,
    handleOption: HandleOption = defaultHandleOption
  ) {
    const { err } = this;
    if (lodashGet(err, 'message') !== msg) return this;
    return this.runCallbackBasedOnHandleOption(cb, handleOption);
  }

  onCancel(cb = voidFunc, handleOption: HandleOption = defaultHandleOption) {
    return this.onErrorMessage('canceled', cb, handleOption);
  }

  onAllButCancel(
    cb = voidFunc,
    handleOption: HandleOption = defaultHandleOption
  ) {
    const { err } = this;
    if (lodashGet(err, 'message') === 'canceled') return this;
    return this.runCallbackBasedOnHandleOption(cb, handleOption);
  }

  onInvalidInputError<
    Path extends ApiProcedurePaths,
    InferredCustomError extends InvalidInputError<Get<API, Path>['input']>
  >(
    path: Path,
    cb: (err: InferredCustomError['zodError']) => void = voidFunc,
    handleOption: HandleOption = defaultHandleOption
  ) {
    const { err } = this;
    if (!(err instanceof TRPCClientError)) {
      return this;
    }
    const { cause } = err;
    function isInvalidInputError(
      clientError: unknown
    ): clientError is InferredCustomError {
      return cause instanceof InvalidInputError;
    }
    if (isInvalidInputError(cause)) {
      return this.runCallbackBasedOnHandleOption(
        () => cb(cause.zodError),
        handleOption
      );
    }
    return this;
  }

  onInvalidOutputError<
    Path extends ApiProcedurePaths,
    InferredCustomError extends InvalidOutputError<
      Get<API, Path>['output']['schema']
    >
  >(
    path: Path,
    cb: (err: InferredCustomError['zodError']) => void = voidFunc,
    handleOption: HandleOption = defaultHandleOption
  ) {
    const { err } = this;
    if (!(err instanceof TRPCClientError)) {
      return this;
    }
    const { cause } = err;
    function isInvalidOutputError(
      clientError: unknown
    ): clientError is InferredCustomError {
      return cause instanceof InvalidOutputError;
    }
    if (isInvalidOutputError(cause)) {
      return this.runCallbackBasedOnHandleOption(
        () => cb(cause.zodError),
        handleOption
      );
    }
    return this;
  }

  onStatusLayerError<
    Path extends ApiProcedurePaths,
    InferredCustomError extends StatusLayerError<
      z.infer<Get<API, Path>['output']['schema']> & { status: 'error' }
    >
  >(
    path: Path,
    cb: (err: InferredCustomError['error']) => void = voidFunc,
    handleOption: HandleOption = defaultHandleOption
  ) {
    const { err } = this;
    if (!(err instanceof TRPCClientError)) {
      return this;
    }
    const { cause } = err;
    function isStatusLayerError(
      clientError: unknown
    ): clientError is InferredCustomError {
      return cause instanceof StatusLayerError;
    }
    if (isStatusLayerError(cause)) {
      return this.runCallbackBasedOnHandleOption(
        () => cb(cause.error),
        handleOption
      );
    }
    return this;
  }
}
