import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import PostBody from '../../components/islands/PostBody.astro';
import { getPost } from '../../lib/data';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  const slug = url.searchParams.get('slug') ?? '';
  const post = await getPost(slug, request);
  const container = await AstroContainer.create();
  const html = await container.renderToString(PostBody, {
    props: { data: post.data?.post },
  });
  return new Response(`<article class="max-w-3xl mx-auto px-6 sm:px-8 py-16" data-tina-island="/tina-island/post?slug=${encodeURIComponent(slug)}">${html}</article>`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
