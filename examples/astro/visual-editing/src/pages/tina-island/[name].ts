/**
 * Single dynamic endpoint that handles every island refetch the bridge
 * sends. The URL path (`/tina-island/post`, `/tina-island/global`, etc.)
 * picks an entry out of the registry in `src/lib/islands.ts`; that entry
 * supplies the fetcher, component, and outer wrapper. Adding a new
 * editable region only ever touches the registry — never this file.
 */
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { islands } from '../../lib/islands';

export const prerender = false;

export const ALL: APIRoute = async ({ params, request, url }) => {
  const island = islands[params.name ?? ''];
  if (!island) {
    return new Response(`Unknown island "${params.name}"`, { status: 404 });
  }

  const data = await island.fetch(request, url.searchParams);
  const container = await AstroContainer.create();
  const html = await container.renderToString(island.component, {
    props: island.propsFromData(data, url.searchParams),
  });

  const { tag, className } = island.wrapper;
  const cls = className ? ` class="${className}"` : '';
  const marker = `${url.pathname}${url.search}`;

  return new Response(
    `<${tag}${cls} data-tina-island="${marker}">${html}</${tag}>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );
};
