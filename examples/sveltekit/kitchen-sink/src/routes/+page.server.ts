import { requestWithMetadata } from '@tinacms/sveltekit/data';
import client from '#tina/__generated__/client.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const pageQuery = await requestWithMetadata(
    client.queries.page({ relativePath: 'home.md' }),
    event,
    { priority: 'primary' }
  );

  return { pageQuery };
};
