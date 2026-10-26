import { AuthError, type Session } from '../../../core/auth/contract';
import type { ServerSegment } from '../../../core/plugin';
import type { TinaCloudOptions } from '../client';
import { fetchProjectIdentity } from './identity';

const VERIFY_TIMEOUT_MS = 10_000;

const BEARER = /^Bearer (\S+)$/i;

export const bearerTokenOf = (request: Request): string | undefined =>
  BEARER.exec(request.headers.get('authorization') ?? '')?.[1];

export const createTinaCloudAuthServer = ({ clientId }: TinaCloudOptions) =>
  ({
    getSession: async (request: Request): Promise<Session | null> => {
      const token = bearerTokenOf(request);
      if (!token) return null;
      try {
        const identity = await fetchProjectIdentity(
          clientId,
          token,
          AbortSignal.timeout(VERIFY_TIMEOUT_MS)
        );
        if (!identity.active) return null;
        return { identity: identity.user, roles: identity.roles };
      } catch (cause) {
        if (cause instanceof AuthError && cause.code !== 'network') {
          return null;
        }
        throw cause;
      }
    },
  }) satisfies ServerSegment;
