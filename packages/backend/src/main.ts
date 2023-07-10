/**
 * Install and generate prisma at runtime.
 * Import here to make Nx generated package.json aware of prisma.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'prisma';

import { buildApp } from './app';

const server = buildApp();

server.listen(
  {
    port: 4000,
    host: '0.0.0.0',
  },
  (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
  }
);

export type { AppRouter } from './trpc/trpc.router';
