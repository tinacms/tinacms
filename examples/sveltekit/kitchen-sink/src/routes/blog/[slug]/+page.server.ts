import { error } from '@sveltejs/kit';
import { requestWithMetadata } from '@tinacms/sveltekit/data';
import client from '#tina/__generated__/client.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = async () => {
  const response = await client.queries.blogConnection({ first: 1000 });
  return (
    response.data.blogConnection.edges?.flatMap((edge) => {
      const slug = edge?.node?._sys.filename;
      return slug ? [{ slug }] : [];
    }) ?? []
  );
};

export const load: PageServerLoad = async (event) => {
  const blogQuery = await requestWithMetadata(
    client.queries.blog({ relativePath: `${event.params.slug}.md` }),
    event,
    { priority: 'primary' }
  );
  // requestWithMetadata returns empty data instead of throwing when the document is missing.
  if (!blogQuery.data.blog) error(404, 'Blog post not found');

  return { blogQuery };
};
