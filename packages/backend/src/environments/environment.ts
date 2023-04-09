export const env = {
  redisHost: process.env.REDIS_HOST || '0.0.0.0',
  isDev: process.env.NODE_ENV === 'development',
  postgresDatabaseUrl: process.env.POSTGRES_DATABASE_URL,
  auth0AhaExampleDomain: process.env.AUTH0_AHA_EXAMPLE_DOMAIN,
  auth0AhaExampleSecret: process.env.AUTH0_AHA_EXAMPLE_SECRET,
  auth0AuthAudience: process.env.AUTH0_AUTH_AUDIENCE,
};
