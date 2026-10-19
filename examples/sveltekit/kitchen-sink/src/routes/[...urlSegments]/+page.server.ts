import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';
import { requestWithMetadata } from '@tinacms/sveltekit/data';
import client from '#tina/__generated__/client.ts';
import { isFileLink } from '#lib/utils.ts';

export const prerender = true;

export const entries: EntryGenerator = async () => {
  const response = await client.queries.pageConnection({ first: 1000 });
  return (
    response.data.pageConnection.edges?.flatMap((edge) => {
      const urlSegments = edge?.node?._sys.breadcrumbs.join('/');
      return urlSegments && urlSegments !== 'home' ? [{ urlSegments }] : [];
    }) ?? []
  );
};

export const load: PageServerLoad = async (event) => {
  if (isFileLink(event.params.urlSegments)) error(404, 'Page not found');

  const pageQuery = await requestWithMetadata(
    client.queries.page({ relativePath: `${event.params.urlSegments}.md` }),
    event,
    { priority: 'primary' }
  );
  // requestWithMetadata returns empty data instead of throwing when the document is missing.
  if (!pageQuery.data.page) error(404, 'Page not found');

  return { pageQuery };
};
