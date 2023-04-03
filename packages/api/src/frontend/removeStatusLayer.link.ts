import { TRPCLink, createTRPCProxyClient } from '@trpc/client';
import { AnyRouter, ProcedureType } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { get as lodashGet } from 'lodash';
import { ZodType } from 'zod';
import { api } from '../api';
import {
  wrapWithTRPCClientError,
  InternalClientError,
  InvalidInputError,
  InvalidOutputError,
  StatusLayerError,
} from './customApiErrors';

export const unwrapStatusLayerLink: TRPCLink<AnyRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const { path, input } = op;
      // Assert api object should contain input/output zod schema in path
      const validatorPaths = [`${path}.input`, `${path}.output.schema`];
      const [inputValidator, outputValidator] = validatorPaths.map((vp) =>
        lodashGet(api, vp)
      );
      /* Input Schema Invalid */
      if (!(inputValidator instanceof ZodType)) {
        return observer.error(
          wrapWithTRPCClientError(
            new InternalClientError(
              `The registered object in path ${
                validatorPaths[0]
              } is not a ZodType. The type is ${typeof inputValidator} and it coerces to string as: ${inputValidator}. Please modify the def in api.`
            )
          )
        );
      }
      /* Output Schema Invalid */
      if (!(outputValidator instanceof ZodType)) {
        return observer.error(
          wrapWithTRPCClientError(
            new InternalClientError(
              `The registered object in path ${
                validatorPaths[1]
              } is not a ZodType. The type is ${typeof outputValidator} and it coerces to string as: ${outputValidator}. Please modify the def in api.`
            )
          )
        );
      }
      const result = inputValidator.safeParse(input);
      /* Input Invalid */
      if (!result.success) {
        return observer.error(
          wrapWithTRPCClientError(
            new InvalidInputError(
              `'The request, about to send to server, of path: ${path} is in unexpected data format.'`,
              result.error
            )
          )
        );
      }

      const unsubscribe = next(op).subscribe({
        next(value) {
          if (value.result.type === 'data') {
            const data = value.result.data;
            const result = outputValidator.safeParse(data);
            /* Output Invalid */
            if (!result.success) {
              return observer.error(
                wrapWithTRPCClientError(
                  new InvalidOutputError(
                    'The server response is in unexpected data format.',
                    result.error
                  )
                )
              );
            }
            /* Meaningful Error Flagged by Error Status */
            if (lodashGet(result.data, 'status') === 'error') {
              const errorData = lodashGet(result.data, 'errorData');
              return observer.error(
                wrapWithTRPCClientError(
                  new StatusLayerError<typeof errorData>(
                    'Server response with error status.',
                    errorData
                  )
                )
              );
            }
            /* Status `ok` => Unwrap the data */
            if (lodashGet(result.data, 'status') === 'ok') {
              value.result.data = lodashGet(result.data, 'data');
            }
          }
          observer.next(value);
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });
      return unsubscribe;
    });
  };
};

type UnwrapStatusLayer<Client> = {
  [key in keyof Client]: key extends ProcedureType
    ? Client[key] extends (...rest: infer arguments) => infer response
      ? Awaited<response> & { status: 'ok' } extends { data: infer Data }
        ? (...rest: arguments) => Promise<Data>
        : never
      : never
    : UnwrapStatusLayer<Client[key]>;
};
/**
 * Adjust the type of trpc client, such that errors are removed,
 * data are unwrapped from response. The real implementation is in
 * the unwrapStatusLayerLink.
 */
export const unwrapStatusLayer: <
  Client extends ReturnType<typeof createTRPCProxyClient<AnyRouter>>
>(
  client: Client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => UnwrapStatusLayer<Client> = (client) => client as any;
