import { invariant } from '../../core/invariant';
import { type PluginManifest, definePlugin } from '../../core/plugin';
import type { SearchFields } from '../../core/search/index-contract';
import { searchWiring } from '../search/search.plugin';
import type { TinaCloudOptions } from './client';
import { mediaUrl } from './media/read';
import { TINACLOUD_PLUGIN_NAME } from './name';

export type { TinaCloudOptions } from './client';

/**
 * `fields` names the searchable collections and fields, as `defineSearchPlugin`
 * does; its weights are unused. `publicToken` is TinaCloud's Public Search token
 * (access `search:read`, safe in a browser bundle): with it, website visitors
 * can search, and `branch` is required because the token cannot look up the
 * default branch. Without it, only signed-in editors can search.
 */
export type TinaCloudSearchOptions = { fields: SearchFields } & (
  | { publicToken?: undefined; branch?: string }
  | { publicToken: string | undefined; branch: string }
);

export interface TinaCloudPluginOptions extends TinaCloudOptions {
  /** Turns on search over TinaCloud's own index. */
  search?: TinaCloudSearchOptions;
}

export const tinaCloud = (options: TinaCloudPluginOptions): PluginManifest => {
  const { search: searchOptions } = options;
  // An `any` env value skips the union above, so the pair is also checked here.
  invariant(
    !searchOptions?.publicToken || searchOptions.branch,
    'tinacloud-search-branch-required',
    '`search.publicToken` needs `search.branch`: the Public Search token cannot look up the default branch.'
  );
  const search = searchOptions && {
    ...searchWiring(searchOptions.fields),
    options: searchOptions,
  };
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
          import('./search/tinacloud-search.server').then(
            ({ createTinaCloudSearchProvider }) =>
              search.serverSegment(
                createTinaCloudSearchProvider(options, search.options),
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
