/**
 * @experimental Built on Astro's `experimental_AstroContainer`. Both APIs
 * may break in any Astro minor/patch.
 */
import {
  type IslandWrapper,
  assertValidIslands,
  handleIslandRequest,
} from '@tinacms/bridge/island';
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { type CollectedForm, formsStore } from './internal/forms-store';
import { requestStore } from './internal/request-context';

export type { IslandWrapper };

export interface IslandConfig {
  /** Resolve the data the component needs. May ignore the search params. */
  fetch: (request: Request, params: URLSearchParams) => Promise<unknown>;
  /** Astro component to render with the fetched data. */
  component: AstroComponentFactory;
  /** Outer element the bridge swaps into — must match the page-side wrapper. */
  wrapper: IslandWrapper;
  /** Map fetched data + URL params to the component's props. */
  propsFromData: (
    data: unknown,
    params: URLSearchParams
  ) => Record<string, unknown>;
}

export type IslandRegistry = Record<string, IslandConfig>;

export function experimental_createIslandRoute(
  islands: IslandRegistry
): APIRoute {
  assertValidIslands(islands);

  return ({ params, request, url }) =>
    handleIslandRequest({
      request,
      name: params.name,
      islands,
      render: async (island) => {
        const forms: CollectedForm[] = [];
        const html = await requestStore.run(request, () =>
          formsStore.run(forms, async () => {
            const data = await island.fetch(request, url.searchParams);
            const container = await AstroContainer.create();
            return container.renderToString(island.component, {
              props: island.propsFromData(data, url.searchParams),
            });
          })
        );
        return { html, forms };
      },
    });
}
