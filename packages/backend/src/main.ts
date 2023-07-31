/**
 * Install and generate prisma at runtime.
 * Import here to make Nx generated package.json aware of prisma.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'prisma';

import { buildApp } from './app';
import { env } from './environments/environment';

const server = buildApp();

server.listen(
  {
    port: 4000,
    host: env.backendHost,
  },
  (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  }
);

export type { AppRouter } from './trpc/trpc.router';
