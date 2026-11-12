import type { RequestHandler } from '@sveltejs/kit';
import {
  type IslandWrapper,
  assertValidIslands,
  handleIslandRequest,
} from '@tinacms/bridge/island';
import type { Component } from 'svelte';
import { render as renderComponent } from 'svelte/server';
import { TINA_FORMS, type TinaLocals } from '../internal/forms-store';

export interface TinaIslandConfig {
  fetch: (
    event: Parameters<RequestHandler>[0],
    params: URLSearchParams
  ) => Promise<unknown>;
  component: Component<any>;
  propsFromData: (
    data: unknown,
    params: URLSearchParams
  ) => Record<string, unknown>;
  wrapper: IslandWrapper;
}

export type TinaIslandRegistry = Record<string, TinaIslandConfig>;

export function experimental_createIslandHandler(
  islands: TinaIslandRegistry
): RequestHandler {
  assertValidIslands(islands);

  return (event) =>
    handleIslandRequest({
      request: event.request,
      name: event.params.name,
      islands,
      render: async (island) => {
        const locals = event.locals as TinaLocals;
        locals[TINA_FORMS] ??= [];

        const params = event.url.searchParams;
        const data = await island.fetch(event, params);
        const { body } = renderComponent(island.component, {
          props: island.propsFromData(data, params),
        });
        return { html: body, forms: locals[TINA_FORMS] };
      },
    });
}
