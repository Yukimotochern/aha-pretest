import { z } from 'zod';
export const auth0JwtSchema = z.object({
  header: z.object({
    alg: z.string(),
    kid: z.string(),
  }),
  payload: z.object({
    sub: z.string(),
    email: z.optional(z.string()),
    name: z.optional(z.string()),
  }),
});

export const appJwtSchema = z.object({
  payload: z.object({
    sub: z.string(),
    iat: z.number(),
    exp: z.number(),
  }),
});

export const auth0SecretSchema = z.object({
  keys: z.array(
    z.object({
      alg: z.string(),
      kid: z.string(),
      x5c: z.array(z.string()).min(1),
    })
  ),
});

export const auth0PostTokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
});
