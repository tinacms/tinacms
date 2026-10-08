import type { AuthSlice, AuthUser } from '../core/auth/contract';
import { type CapabilityOverride, definePlugin } from '../core/plugin';

export const testAuthPlugin = (
  name: string,
  user: AuthUser,
  overrides?: CapabilityOverride[]
) =>
  definePlugin({
    name,
    provides: ['auth'],
    overrides,
    client: async () => ({
      default: {
        slice: (set) => {
          let token: string | undefined;
          return {
            status: 'signed-out',
            user: null,
            getToken: async () => token,
            login: async () => {
              token = `${name}-token`;
              set({ status: 'signed-in', user });
            },
            logout: async () => {
              token = undefined;
              set({ status: 'signed-out', user: null });
            },
          } satisfies AuthSlice;
        },
      },
    }),
  });
