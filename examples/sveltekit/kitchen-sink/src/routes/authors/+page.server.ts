import client from '#tina/__generated__/client.ts';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = async () => {
  const response = await client.queries.authorConnection({ first: 1000 });
  const authors =
    response.data.authorConnection.edges?.flatMap((edge) => {
      const node = edge?.node;
      if (!node) return [];
      return [
        {
          slug: node._sys.filename,
          name: node.name,
          avatar: node.avatar,
          description: node.description,
        },
      ];
    }) ?? [];

  return { authors };
};
