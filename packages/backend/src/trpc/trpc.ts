import { TRPCError, initTRPC } from '@trpc/server';
import { OpenApiMeta } from 'trpc-openapi';
import superjson from 'superjson';
import { Context } from './context';

const t = initTRPC.meta<OpenApiMeta>().context<Context>().create({
  transformer: superjson,
});

export const router = t.router;

export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(
  async ({ ctx: { fastifyReq, prisma }, next }) => {
    const nonce = fastifyReq.headers['authorization'];
    if (!nonce) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      });
    }
    const session = await prisma.session.findFirst({
      where: {
        id: nonce,
        expiredAt: {
          gte: new Date(),
        },
        active: true,
      },
      include: {
        user: true,
      },
    });
    if (!session || !session.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      });
    }
    await prisma.session.update({
      where: {
        id: nonce,
      },
      data: {
        updatedAt: new Date(),
      },
    });
    return next({
      ctx: {
        user: session.user,
      },
    });
  }
);

export const middleware = t.middleware;
