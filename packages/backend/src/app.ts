import { fastify, FastifyServerOptions } from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { fastifyTRPCOpenApiPlugin } from 'trpc-openapi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { logger, bodyLogger, genReqIdFunctionCreator } from './utils/logger';
import { createContext } from './trpc/context';
import { appRouter, trpcOpenApiDocument } from './trpc/trpc.router';

dayjs.extend(utc);

export const buildApp = (opts: FastifyServerOptions = {}) => {
  const appOptions: FastifyServerOptions = {
    /* pino logger */
    logger,
    /* generate request id for each request, uuid or serial number string */
    genReqId: genReqIdFunctionCreator(),
    ...opts,
  };
  const app = fastify(appOptions);

  /* plugins here */
  app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
    global: true,
  });
  app.register(fastifyCookie);

  /* log body if present */
  app.addHook('preHandler', bodyLogger);

  /* tRPC goes here */
  app.register(fastifyTRPCPlugin<typeof appRouter>, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ error, type, path, req }) {
        req.log.error(error, `${path}.${type}`);
      },
    },
  });

  app.register(fastifyTRPCOpenApiPlugin, {
    router: appRouter,
    basePath: '/api',
    createContext,
  });

  app.get('/openapi.json', () => trpcOpenApiDocument);

  app.register(fastifySwagger, {
    prefix: '/docs',
    mode: 'static',
    specification: { document: trpcOpenApiDocument },
  });
  app.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      displayOperationId: true,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
  });

  return app;
};
