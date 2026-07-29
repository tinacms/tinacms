// The client half of the local data layer. This plugin provides the `content` capability
// during local development. Its slice mounts at the `content` namespace, from
// SINGLETON_SLICE_CAPABILITIES, and it speaks the wire protocol of content-request.ts.
// Refer to local-content.client.ts. A TinaCloud provider, or a v3 provider, replaces this
// plugin and mounts a slice of the same shape.

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
