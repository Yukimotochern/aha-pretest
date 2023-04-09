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
