import { inferAsyncReturnType } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { statusLayerResponse } from '@aha/api';
import { PrismaClient } from '@prisma/client';

import { env } from '../environments/environment';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.postgresDatabaseUrl,
    },
  },
});

export function createContext({ req, res }: CreateFastifyContextOptions) {
  return {
    fastify: res.server,
    fastifyReq: req,
    fastifyRes: res,
    env,
    logger: req.log,
    res: statusLayerResponse,
    prisma,
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;
