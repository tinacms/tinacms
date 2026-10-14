import { type PluginManifest, definePlugin } from '../../core/plugin';
import type { TinaCloudOptions } from './client';
import { mediaUrl } from './media/read';

export type { TinaCloudOptions } from './client';

export const TINACLOUD_PLUGIN_NAME = 'tina:tinacloud';

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
      ] = await Promise.all([
        import('./auth/tinacloud-auth.client'),
        import('./media/tinacloud-media.client'),
        import('./content/tinacloud-content.client'),
      ]);
      return {
        default: {
          slices: {
            auth: createTinaCloudAuth(options).slice,
            media: createTinaCloudMediaSlice(options),
            content: createTinaCloudContentSlice(options),
          },
        },
      };
    },
  });
