import {
  DEFAULT_MEDIA_ROOT,
  DEFAULT_MEDIA_URL,
  type ResolveMediaUrl,
} from '../../../core/media/contract';
import { definePlugin, type PluginManifest } from '../../../core/plugin';
import { encodePath } from '../../../utils/encode-path';

export const LOCAL_MEDIA_PLUGIN_NAME = 'tina:media:local';

export const MEDIA_ERROR_HEADER = 'x-tina-media-error';

export const localMediaPlugin = (options?: {
  url?: string;
  mediaRoot?: string;
}): PluginManifest => {
  const mediaRoot = options?.mediaRoot ?? DEFAULT_MEDIA_ROOT;
  const resolveUrl: ResolveMediaUrl = (path) =>
    `/${mediaRoot}/${encodePath(path)}`;
  return definePlugin({
    name: LOCAL_MEDIA_PLUGIN_NAME,
    provides: ['media'],
    media: { resolveUrl },
    client: async () => {
      const { createMediaSlice } = await import('./local-media.client');
      return {
        default: {
          slice: createMediaSlice(
            options?.url ?? DEFAULT_MEDIA_URL,
            resolveUrl
          ),
        },
      };
    },
  });
};
