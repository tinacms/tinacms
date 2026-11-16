import { type PluginManifest, definePlugin } from '../../core/plugin';
import type { TinaCloudOptions } from './client';
import { mediaUrl } from './media/read';
import { TINACLOUD_PLUGIN_NAME } from './name';

export type { TinaCloudOptions } from './client';

export const tinaCloud = (options: TinaCloudOptions): PluginManifest =>
  definePlugin({
    name: TINACLOUD_PLUGIN_NAME,
    provides: ['media', 'auth', 'content'],
    // The site has no store, so it reads from the media branch.
    media: {
      resolveUrl: (path, size) =>
        mediaUrl(options.clientId, undefined, path, size),
    },
    client: async () => {
      const [
        { createTinaCloudAuth },
        { createTinaCloudMediaSlice },
        { createTinaCloudContentSlice },
        { tinaCloudNav },
      ] = await Promise.all([
        import('./auth/tinacloud-auth.client'),
        import('./media/tinacloud-media.client'),
        import('./content/tinacloud-content.client'),
        import('./nav/tinacloud-nav.client'),
      ]);
      const auth = createTinaCloudAuth(options);
      const clientOptions = { ...options, getToken: auth.tinaCloudToken };
      return {
        default: {
          slices: {
            auth: auth.slice,
            media: createTinaCloudMediaSlice(clientOptions),
            content: createTinaCloudContentSlice(clientOptions),
          },
          slots: tinaCloudNav(options.clientId),
        },
      };
    },
    server: async () => {
      const [{ createTinaCloudAuthServer }, { createTinaCloudContentServer }] =
        await Promise.all([
          import('./auth/tinacloud-auth.server'),
          import('./content/tinacloud-content.server'),
        ]);
      return {
        default: {
          ...createTinaCloudAuthServer(options),
          ...createTinaCloudContentServer(options),
        },
      };
    },
  });
