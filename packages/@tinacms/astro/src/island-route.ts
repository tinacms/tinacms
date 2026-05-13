/**
 * Factory for the dynamic `/tina-island/[name]` endpoint the bridge calls
 * to refetch a region with the editor's overlay applied. Each entry in
 * `islands` describes one editable region: how to load its data, which
 * Astro component to render, and the wrapper element the page-side
 * `<div data-tina-island>` is expected to swap.
 *
 * The render runs inside the same request/forms AsyncLocalStorage scopes
 * the `tina()` middleware uses, so `requestWithMetadata` calls inside the
 * island's loader (a) pick up the overlay the bridge POSTed and (b) record
 * their form payloads. On the bridge's one-time "prime" refetch (a static
 * page that has no server-injected `[data-tina-form]` yet) those payloads
 * are prepended to the response as `<div data-tina-form>` so the bridge can
 * register the page's forms; ordinary refetches omit them.
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
import { PREVIEW_CONTENT_TYPE, PRIME_HEADER } from '@tinacms/bridge/preview';
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { escapeAttr } from './internal/escape';
import {
  type CollectedForm,
  formsStore,
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

    const priming = request.headers.get(PRIME_HEADER) !== null;

    try {
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

/** Hidden `<div data-tina-form>` payloads — same wire shape the middleware
 *  splices into edit-mode SSR pages, so the bridge parses them identically.
 *
 *  `data-tina-primary` tracks the explicit `priority: 'primary'` flag rather
 *  than position. Each island route call is independent, so a positional
 *  marker (`i === 0`) would tag *every* island's first form — on a page
 *  with `[page, global-header, global-footer]` islands, the bridge would
 *  see three competing primaries and the first in DOM order (usually the
 *  layout's global) would win the retry loop. */
function renderFormPayloads(forms: CollectedForm[]): string {
  return sortByPriority(forms)
    .map(
      (form) =>
        `<div data-tina-form="${escapeAttr(JSON.stringify(form))}"${
          form.priority === 'primary' ? ' data-tina-primary' : ''
        } hidden></div>`
    )
    .join('');
}

function wrapIsland(html: string, wrapper: IslandWrapper, url: URL): string {
  const cls = wrapper.className
    ? ` class="${escapeAttr(wrapper.className)}"`
    : '';
  const marker = escapeAttr(`${url.pathname}${url.search}`);
  return `<${wrapper.tag}${cls} data-tina-island="${marker}">${html}</${wrapper.tag}>`;
}
