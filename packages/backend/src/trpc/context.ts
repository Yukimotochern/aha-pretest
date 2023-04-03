import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { okResponse, errorResponse } from '@aha/api';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const user = { name: req.headers.username ?? 'anonymous' };
  return { req, res, user, logger: req.log, okResponse, errorResponse };
}
export type Context = inferAsyncReturnType<typeof createContext>;
