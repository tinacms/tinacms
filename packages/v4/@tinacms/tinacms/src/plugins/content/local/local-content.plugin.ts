
import { DEFAULT_CONTENT_URL } from '../../../core/content/contract';
import { type PluginManifest, definePlugin } from '../../../core/plugin';

export const localContentPlugin = (options?: {
  url?: string;
}): PluginManifest =>
  definePlugin({
    name: 'tina:content:local',
    provides: ['content'],
    client: async () => {
      const { createContentSlice } = await import('./local-content.client');
      return {
        default: {
          slice: createContentSlice(options?.url ?? DEFAULT_CONTENT_URL),
        },
      };
    },
  });
