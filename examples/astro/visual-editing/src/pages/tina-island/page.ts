import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Blocks from '../../components/blocks/Blocks.astro';
import { getPage } from '../../lib/data';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const slug = url.searchParams.get('slug') ?? 'home';
  const page = await getPage(slug, request);
  const container = await AstroContainer.create();
  const html = await container.renderToString(Blocks, {
    props: { blocks: page.data?.page?.blocks ?? [] },
  });
  return new Response(`<div data-tina-island="/tina-island/page?slug=${encodeURIComponent(slug)}">${html}</div>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
