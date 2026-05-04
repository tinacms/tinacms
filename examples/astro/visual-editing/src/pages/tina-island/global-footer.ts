import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '../../components/layout/Footer.astro';
import { getGlobal } from '../../lib/data';

export const prerender = false;

export const ALL: APIRoute = async ({ request, url }) => {
  const path = url.searchParams.get('path') ?? '/';
  const global = await getGlobal(request);
  const container = await AstroContainer.create();
  const html = await container.renderToString(Footer, {
    props: { data: global.data?.global?.footer },
  });
  return new Response(`<div data-tina-island="/tina-island/global-footer?path=${encodeURIComponent(path)}">${html}</div>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
