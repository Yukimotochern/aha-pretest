export const environment = {
  redisHost: process.env.REDIS_HOST || '0.0.0.0',
  isDev: process.env.NODE_ENV === 'development',
  postgresDatabaseUrl: process.env.POSTGRES_DATABASE_URL,
};
