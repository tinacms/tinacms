import {
  DEFAULT_MEDIA_ROOT,
  DEFAULT_MEDIA_URL,
} from '../../../core/media/contract';
import { definePlugin, type PluginManifest } from '../../../core/plugin';

export const localMediaPlugin = (options?: {
  url?: string;
  mediaRoot?: string;
}): PluginManifest =>
  definePlugin({
    name: 'tina:media:local',
    provides: ['media'],
    client: async () => {
      const { createMediaSlice } = await import('./local-media.client');
      return {
        default: {
          slice: createMediaSlice(
            options?.url ?? DEFAULT_MEDIA_URL,
            options?.mediaRoot ?? DEFAULT_MEDIA_ROOT
          ),
        },
      };
    },
  });
