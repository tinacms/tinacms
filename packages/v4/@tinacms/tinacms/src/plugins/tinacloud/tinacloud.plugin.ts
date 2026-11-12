import { type PluginManifest, definePlugin } from '../../core/plugin';
import type { SearchFields } from '../../core/search/index-contract';
import { searchWiring } from '../search/search.plugin';
import type { TinaCloudOptions } from './client';
import { mediaUrl } from './media/read';
import { TINACLOUD_PLUGIN_NAME } from './name';

export type { TinaCloudOptions } from './client';

export interface TinaCloudPluginOptions extends TinaCloudOptions {
  /**
   * Turns on search over TinaCloud's own index. `fields` names the searchable
   * collections and fields, as `defineSearchPlugin` does. Its weights are unused.
   */
  search?: { fields: SearchFields };
}

export const tinaCloud = (options: TinaCloudPluginOptions): PluginManifest => {
  const search = options.search && searchWiring(options.search.fields);
  return definePlugin({
    name: TINACLOUD_PLUGIN_NAME,
    provides: search
      ? ['media', 'auth', 'content', 'search']
      : ['media', 'auth', 'content'],
    ...(search && { search: search.search }),
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
            ...(search && {
              search: await search.clientSlice(auth.tinaCloudTokenIfMounted),
            }),
          },
          slots: tinaCloudNav(options.clientId),
        },
      };
    },
    server: async () => {
      const [
        { createTinaCloudAuthServer },
        { createTinaCloudContentServer },
        searchSegment,
      ] = await Promise.all([
        import('./auth/tinacloud-auth.server'),
        import('./content/tinacloud-content.server'),
        search &&
          options.search &&
          import('./search/tinacloud-search.server').then(
            ({ createTinaCloudSearchProvider }) =>
              search.serverSegment(
                createTinaCloudSearchProvider(options, options.search.fields),
                { saveHook: false }
              )
          ),
      ]);
      return {
        default: {
          ...createTinaCloudAuthServer(options),
          ...createTinaCloudContentServer(options),
          ...searchSegment,
        },
      };
    },
  });
};
