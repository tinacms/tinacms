import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import AuthorBody from '../../components/islands/AuthorBody.astro';
import { getAuthor } from '../../lib/data';

export const prerender = false;

export const ALL: APIRoute = async ({ request, url }) => {
  const filename = url.searchParams.get('filename') ?? '';
  const author = await getAuthor(filename, request);
  const container = await AstroContainer.create();
  const html = await container.renderToString(AuthorBody, {
    props: { data: author.data?.author },
  });
  return new Response(
    `<section class="max-w-3xl mx-auto px-6 sm:px-8 py-16" data-tina-island="/tina-island/author?filename=${encodeURIComponent(filename)}">${html}</section>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );
};
