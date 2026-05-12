/**
 * Factory for the dynamic `/tina-island/[name]` endpoint the bridge calls
 * to refetch a region with the editor's overlay applied. Each entry in
 * `islands` describes one editable region: how to load its data, which
 * Astro component to render, and the wrapper element the page-side
 * `<div data-tina-island>` is expected to swap.
 *
 * @experimental
 *
 * Built on Astro's `experimental_AstroContainer`, which is itself
 * experimental — Astro may break the underlying API in any minor or patch
 * release. The shape of `createIslandRoute` is similarly experimental and
 * will graduate once the container API stabilises.
 *
 * Usage:
 *
 * ```ts
 * // src/pages/tina-island/[name].ts
 * import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
 * import { islands } from '../../lib/islands';
 *
 * export const prerender = false;
 * export const ALL = experimental_createIslandRoute(islands);
 * ```
 */
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { PREVIEW_CONTENT_TYPE } from '@tinacms/bridge/preview';
import { escapeAttr } from './internal/escape';

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

export function experimental_createIslandRoute(
  islands: IslandRegistry
): APIRoute {
  return async ({ params, request, url }) => {
    const rejection = rejectIfUnsafe(request);
    if (rejection) return rejection;

    const island = islands[params.name ?? ''];
    if (!island) {
      return new Response(`Unknown island "${params.name}"`, { status: 404 });
    }

    try {
      const data = await island.fetch(request, url.searchParams);
      const container = await AstroContainer.create();
      const html = await container.renderToString(island.component, {
        props: island.propsFromData(data, url.searchParams),
      });
      return new Response(wrapIsland(html, island.wrapper, url), {
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

/**
 * Layered defense for an endpoint whose response is shaped by the request
 * body. The bridge always issues a same-origin POST with the Tina-preview
 * content-type; production traffic never matches all three signals so it
 * can never reach the renderer.
 */
function rejectIfUnsafe(request: Request): Response | null {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes(PREVIEW_CONTENT_TYPE)) {
    return new Response('Not Found', { status: 404 });
  }
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site' || fetchSite === 'cross-origin') {
    return new Response('Forbidden', { status: 403 });
  }
  return null;
}

function wrapIsland(html: string, wrapper: IslandWrapper, url: URL): string {
  const cls = wrapper.className
    ? ` class="${escapeAttr(wrapper.className)}"`
    : '';
  const marker = escapeAttr(`${url.pathname}${url.search}`);
  return `<${wrapper.tag}${cls} data-tina-island="${marker}">${html}</${wrapper.tag}>`;
}
