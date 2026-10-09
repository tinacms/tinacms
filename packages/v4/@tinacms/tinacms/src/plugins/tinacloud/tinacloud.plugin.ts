import { type PluginManifest, definePlugin } from '../../core/plugin';
import type { TinaCloudOptions } from './client';
import { tinaCloudMediaUrl } from './media/read';

export type { TinaCloudOptions } from './client';

export const TINACLOUD_PLUGIN_NAME = 'tina:tinacloud';

export const tinaCloud = (options: TinaCloudOptions): PluginManifest =>
  definePlugin({
    name: TINACLOUD_PLUGIN_NAME,
    provides: ['media'],
    media: { resolveUrl: tinaCloudMediaUrl(options.clientId) },
    client: async () => {
      const { createTinaCloudMediaSlice } = await import(
        './media/tinacloud-media.client'
      );
      return {
        default: { slices: { media: createTinaCloudMediaSlice(options) } },
      };
    },
  });
