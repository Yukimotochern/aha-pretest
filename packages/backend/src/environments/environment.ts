export const env = {
  // Runtime Env
  isDev: process.env.NODE_ENV === 'development',
  // DB
  postgresDatabaseUrl: process.env.POSTGRES_DATABASE_URL,
  // Auth0 Auth
  auth0AuthDomain: process.env.AUTH0_AUTH_DOMAIN,
  auth0AuthClientId: process.env.AUTH0_AUTH_CLIENT_ID,
  auth0AuthClientAudience: process.env.AUTH0_AUTH_AUDIENCE,
  // Auth0 Management
  auth0ManagementDomain: process.env.AUTH0_MANAGEMENT_DOMAIN,
  auth0ManagementClientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  auth0ManagementClientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
  auth0ManagementAudience: process.env.AUTH0_MANAGEMENT_AUDIENCE,
  // SendGrid
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || '',
  // Backend
  backendUrl: process.env.BACKEND_URL || '',
  backendHost: process.env.BACKEND_HOST || '0.0.0.0',
  // App Auth
  appJwtSecretKey: process.env.APP_JWT_SECRET_KEY || 'fakeKey',
  appJwtExpireMilliseconds:
    Number(process.env.APP_JWT_EXPIRE_MILLISECONDS) || 86400,
};
