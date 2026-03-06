import type { IncomingMessage, ServerResponse } from 'http';
import { fromNodeHeaders } from 'better-auth/node';
import type { BackendAuthProvider } from '@tinacms/datalayer';

/**
 * Minimal type for the Better Auth server instance (e.g. from lib/auth.ts).
 * Must have api.getSession({ headers }) for server-side session validation.
 */
export interface BetterAuthServer {
  api: {
    getSession: (options: { headers: Headers }) => Promise<{
      user: unknown;
      session: unknown;
    } | null>;
  };
}

export interface BetterAuthBackendOptions {
  /** Better Auth server instance (e.g. auth from lib/auth.ts) */
  auth: BetterAuthServer;
  /**
   * Optional custom authorization. Called with the session user; return false to deny (403).
   * Default: any authenticated user is authorized.
   */
  authorize?: (user: unknown) => Promise<boolean> | boolean;
}

export const BetterAuthBackendAuthProvider = ({
  auth,
  authorize: authorizeFn,
}: BetterAuthBackendOptions): BackendAuthProvider => {
  const authProvider: BackendAuthProvider = {
    isAuthorized: async (req: IncomingMessage, _res: ServerResponse) => {
      const headers = fromNodeHeaders(req.headers);

      const session = await auth.api.getSession({ headers });
      if (!session?.user) {
        return {
          isAuthorized: false,
          errorCode: 401,
          errorMessage: 'Unauthorized',
        };
      }
      if (authorizeFn) {
        const allowed = await authorizeFn(session.user);
        if (!allowed) {
          return {
            isAuthorized: false,
            errorCode: 403,
            errorMessage: 'Forbidden',
          };
        }
      }
      return { isAuthorized: true };
    },
  };
  return authProvider;
};

export { BetterAuthProvider } from './tinacms';
export type { BetterAuthProviderOptions, BetterAuthClient } from './tinacms';
