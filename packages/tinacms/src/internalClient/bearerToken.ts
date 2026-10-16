import type { TokenObject } from '@tinacms/schema-tools';

// TinaCloud reads the caller's email from the JWT, and a Cognito access token
// carries no email claim, so every request sends the ID token when there is one.
export const bearerToken = (token: TokenObject | null | undefined) =>
  token?.id_token ?? token?.access_token ?? null;
