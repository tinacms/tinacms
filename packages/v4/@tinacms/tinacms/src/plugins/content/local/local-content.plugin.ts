// Client half of the Local Data Layer: the plugin providing the `content`
// capability during local dev. Its slice mounts at the `content` namespace
// (SINGLETON_SLICE_CAPABILITIES) and speaks the content-request.ts wire
// protocol (local-content.client.ts). A TinaCloud or v3-compat provider
// replaces this plugin and mounts the same-shaped slice.

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
