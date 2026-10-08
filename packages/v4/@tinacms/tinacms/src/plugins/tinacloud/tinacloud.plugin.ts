import { type PluginManifest, definePlugin } from '../../core/plugin';
import type { TinaCloudOptions } from './client';

export type { TinaCloudOptions } from './client';

export const TINACLOUD_PLUGIN_NAME = 'tina:tinacloud';

export const tinaCloud = (options: TinaCloudOptions): PluginManifest =>
  definePlugin({
    name: TINACLOUD_PLUGIN_NAME,
    provides: ['media', 'auth'],
    client: async () => {
      const [{ createTinaCloudAuth }, { createTinaCloudMediaSlice }] =
        await Promise.all([
          import('./auth/tinacloud-auth.client'),
          import('./media/tinacloud-media.client'),
        ]);
      const auth = createTinaCloudAuth(options);
      return {
        default: {
          slices: {
            auth: auth.slice,
            media: createTinaCloudMediaSlice({
              clientId: options.clientId,
              getToken: auth.getToken,
            }),
          },
        },
      };
    },
    server: async () => {
      const { createTinaCloudAuthServer } = await import(
        './auth/tinacloud-auth.server'
      );
      return { default: createTinaCloudAuthServer(options) };
    },
  });
