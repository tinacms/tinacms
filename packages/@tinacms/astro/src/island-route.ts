/**
 * @experimental Built on Astro's `experimental_AstroContainer`. Both APIs
 * may break in any Astro minor/patch.
 */
import { PREVIEW_CONTENT_TYPE, PRIME_HEADER } from '@tinacms/bridge/preview';
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { escapeAttr } from './internal/escape';
import {
  type CollectedForm,
  formsStore,
  renderFormPayloadDiv,
  sortByPriority,
} from './internal/forms-store';
import { requestStore } from './internal/request-context';

export interface IslandWrapper {
  tag: string;
  className?: string;
}

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

export interface IslandRouteOptions {
  /**
   * Options forwarded to `AstroContainer.create`. Pass `renderers` here so
   * islands that use a UI framework (React, Vue, Svelte, ...) can be rendered —
   * the container is created empty and, unlike the page pipeline, does not
   * inherit renderers from the Astro config.
   *
   * @example
   * import reactRenderer from '@astrojs/react/server.js';
   * experimental_createIslandRoute(islands, {
   *   containerOptions: { renderers: [{ name: '@astrojs/react', ssr: reactRenderer }] },
   * });
   */
  containerOptions?: Parameters<typeof AstroContainer.create>[0];
}

export function experimental_createIslandRoute(
  islands: IslandRegistry,
  options?: IslandRouteOptions
): APIRoute {
  return async ({ params, request, url }) => {
    const rejection = rejectIfUnsafe(request);
    if (rejection) return rejection;

    const island = islands[params.name ?? ''];
    if (!island) {
      return new Response(`Unknown island "${params.name}"`, { status: 404 });
    }

    const priming = request.headers.get(PRIME_HEADER) !== null;

    try {
      const forms: CollectedForm[] = [];
      const html = await requestStore.run(request, () =>
        formsStore.run(forms, async () => {
          const data = await island.fetch(request, url.searchParams);
          const container = await AstroContainer.create(options?.containerOptions);
          return container.renderToString(island.component, {
            props: island.propsFromData(data, url.searchParams),
          });
        })
      );
      const body =
        (priming ? renderFormPayloads(forms) : '') +
        wrapIsland(html, island.wrapper, url);
      return new Response(body, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    } catch {
      return new Response('Island render failed', { status: 500 });
    }
  };
}

// Bridge issues a same-origin POST with the Tina-preview content-type;
// production traffic can't match all three signals.
function rejectIfUnsafe(request: Request): Response | null {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes(PREVIEW_CONTENT_TYPE)) {
    return new Response('Not Found', { status: 404 });
  }
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return new Response('Forbidden', { status: 403 });
  }
  return null;
}

// Keyed on the explicit `primary` flag (not position): each island route
// call is independent, so position would tag every island's first form.
function renderFormPayloads(forms: CollectedForm[]): string {
  return sortByPriority(forms)
    .map((form) => renderFormPayloadDiv(form, form.priority === 'primary'))
    .join('');
}

function wrapIsland(html: string, wrapper: IslandWrapper, url: URL): string {
  const cls = wrapper.className
    ? ` class="${escapeAttr(wrapper.className)}"`
    : '';
  const marker = escapeAttr(`${url.pathname}${url.search}`);
  return `<${wrapper.tag}${cls} data-tina-island="${marker}">${html}</${wrapper.tag}>`;
}
