import { error } from '@sveltejs/kit';
import { experimental_createIslandHandler } from '@tinacms/sveltekit/experimental';
import { requestWithMetadata } from '@tinacms/sveltekit/data';
import PostView from '#lib/components/PostView.svelte';
import client from '#tina/__generated__/client.ts';

export const prerender = false;

export const POST = experimental_createIslandHandler({
  post: {
    component: PostView,
    wrapper: { tag: 'article', className: 'post-content' },
    fetch: (event, params) => {
      const slug = params.get('slug');
      if (
        !slug ||
        !slug
          .split('/')
          .every(
            (part) =>
              /^[A-Za-z0-9_.-]+$/.test(part) && part !== '.' && part !== '..'
          )
      ) {
        throw error(404, 'Post not found');
      }

      return requestWithMetadata(
        client.queries.post({ relativePath: `${slug}.md` }),
        event,
        { priority: 'primary' }
      );
    },
    propsFromData: (data) => ({ query: data }),
  },
});
