import type { Session } from '../../../core/auth/contract';
import { defineServerPlugin } from '../../../server';
import type { TinaCloudOptions } from '../client';
import { currentUserSchema, currentUserUrl } from './tinacloud-auth-types';

const BEARER = /^Bearer (\S+)$/i;

export const createTinaCloudAuthServer = ({ clientId }: TinaCloudOptions) =>
  defineServerPlugin({
    getSession: async (request: Request): Promise<Session | null> => {
      const token = BEARER.exec(
        request.headers.get('authorization') ?? ''
      )?.[1];
      if (!token) return null;
      const response = await fetch(currentUserUrl(clientId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      const parsed = currentUserSchema.safeParse(
        await response.json().catch(() => null)
      );
      if (!parsed.success) return null;
      const { user, role, verified, enabled } = parsed.data;
      if (verified !== true || enabled === false) return null;
      return { identity: user, roles: [role === 'admin' ? 'admin' : 'editor'] };
    },
  });
