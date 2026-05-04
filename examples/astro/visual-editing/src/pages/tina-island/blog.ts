import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BlogBody from '../../components/islands/BlogBody.astro';
import { getBlog } from '../../lib/data';

export const prerender = false;

export const ALL: APIRoute = async ({ request, url }) => {
  const filename = url.searchParams.get('filename') ?? '';
  const blog = await getBlog(filename, request);
  const container = await AstroContainer.create();
  const html = await container.renderToString(BlogBody, {
    props: { data: blog.data?.blog },
  });
  return new Response(
    `<article class="max-w-3xl mx-auto px-6 sm:px-8 py-16" data-tina-island="/tina-island/blog?filename=${encodeURIComponent(filename)}">${html}</article>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );
};
