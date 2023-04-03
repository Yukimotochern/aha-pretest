import { fastify, FastifyServerOptions } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyRedis from '@fastify/redis';

import { environment as env } from './environments/environment';
import { logger, bodyLogger, genReqIdFunctionCreator } from './utils/logger';
import { createContext } from './trpc/context';
import { appRouter } from './trpc/trpc.router';

export const buildApp = (opts: FastifyServerOptions = {}) => {
  const appOptions: FastifyServerOptions = {
    /* pino logger */
    logger,
    /* generate request id for each request, uuid or serial number string */
    genReqId: genReqIdFunctionCreator(),
    ...opts,
  };
  const app = fastify(appOptions).withTypeProvider<TypeBoxTypeProvider>();

  /* plugins here */
  app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    global: true,
  });
  app.register(fastifyCookie);
  app.register(fastifyRedis, {
    host: env.redisHost || '0.0.0.0',
  });

  /* log body if present */
  app.addHook('preHandler', bodyLogger);

  app.register(fastifyTRPCPlugin, {
    prefix: '/api/trpc',
    trpcOptions: { router: appRouter, createContext },
  });

  /* routes */
  app.post('/', async function (req, res) {
    res.cookie('auth', '', {
      path: '/',
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
    });

    return res.send('hi');
  });

  return app;
};
