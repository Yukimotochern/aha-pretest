import {
  createTRPCProxyClient,
  httpBatchLink,
  TRPCClientError,
} from '@trpc/client';
import superjson from 'superjson';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from '@aha/backend';
import { unwrapStatusLayerLink, unwrapStatusLayer } from '@aha/api';
import { observable } from '@trpc/server/observable';
import { getRouter } from '../router.alias';
import { getMessageApi } from '../utils/message';

export function isTRPCClientError(
  cause: unknown
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}

export type StoreWithSession = {
  getState: () => { auth: { session: string } };
};

let store: StoreWithSession;

export const injectStore = (_store: StoreWithSession) => {
  store = _store;
};

export const trpcWithStatusLayer = createTRPCProxyClient<AppRouter>({
  links: [
    unwrapStatusLayerLink,
    () =>
      ({ next, op }) => {
        return observable((observer) =>
          next(op).subscribe({
            next(value) {
              return observer.next(value);
            },
            error(err) {
              if (
                err instanceof TRPCClientError &&
                err.data?.code === 'UNAUTHORIZED'
              ) {
                getRouter().navigate('/landing?flow=login');
                getMessageApi().info('Please login again.');
              }
            },
            complete() {
              observer.complete();
            },
          })
        );
      },
    httpBatchLink({
      url: '/trpc',
      headers: () => {
        /* Authorization */
        if (store) {
          const {
            auth: { session },
          } = store.getState();
          return {
            authorization: session,
          };
        } else {
          return {};
        }
      },
    }),
  ],
  transformer: superjson,
});

export const trpc = unwrapStatusLayer(trpcWithStatusLayer);
