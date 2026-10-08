import type { Session } from '../../../core/auth/contract';
import type { ServerSegment } from '../../../core/plugin';
import type { TinaCloudOptions } from '../client';
import { currentUserSchema, currentUserUrl } from './tinacloud-auth-types';

const VERIFY_TIMEOUT_MS = 10_000;

const BEARER = /^Bearer (\S+)$/i;

export const createTinaCloudAuthServer = ({ clientId }: TinaCloudOptions) =>
  ({
    getSession: async (request: Request): Promise<Session | null> => {
      const token = BEARER.exec(
        request.headers.get('authorization') ?? ''
      )?.[1];
      if (!token) return null;
      const response = await fetch(currentUserUrl(clientId), {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      });
      if (!response.ok) return null;
      const parsed = currentUserSchema.safeParse(
        await response.json().catch(() => null)
      );
      if (!parsed.success) return null;
      const { user, roles, active } = parsed.data;
      if (!active) return null;
      return { identity: user, roles };
    },
  }) satisfies ServerSegment;
