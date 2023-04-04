import {
  createTRPCProxyClient,
  httpBatchLink,
  TRPCClientError,
} from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@aha/backend';
import { unwrapStatusLayerLink, unwrapStatusLayer } from '@aha/api';

export function isTRPCClientError(
  cause: unknown
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}

export const trpcWithStatusLayer = createTRPCProxyClient<AppRouter>({
  links: [
    unwrapStatusLayerLink,
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
  transformer: superjson,
});

export const trpc = unwrapStatusLayer(trpcWithStatusLayer);
