import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import HeroIsland from '../../components/HeroIsland.astro';
import { getPageData } from '../../lib/tina-preview';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const slug = url.searchParams.get('slug') ?? 'home';
  const { data } = await getPageData(slug, request);

  const container = await AstroContainer.create();
  const html = await container.renderToString(HeroIsland, {
    props: {
      data: data.page.hero,
      islandEndpoint: `/tina-island/hero?slug=${slug}`,
    },
  });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
