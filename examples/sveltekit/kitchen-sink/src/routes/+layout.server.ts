import type { LayoutServerLoad } from './$types';
import { requestWithMetadata } from '@tinacms/sveltekit/data';
import client from '#tina/__generated__/client.ts';

// requestWithMetadata never throws: if the query fails it logs a warning and returns
// empty data, so the layout falls back to its defaults instead of crashing the site.
export const load: LayoutServerLoad = async (event) => ({
  globalQuery: await requestWithMetadata(
    client.queries.global({ relativePath: 'index.json' }),
    event
  ),
});
