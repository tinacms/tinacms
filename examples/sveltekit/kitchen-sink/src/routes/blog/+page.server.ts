import client from '#tina/__generated__/client.ts';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = async () => {
  const response = await client.queries.blogConnection({ first: 1000 });
  const blogs =
    response.data.blogConnection.edges?.flatMap((edge) => {
      const node = edge?.node;
      if (!node) return [];
      return [
        {
          slug: node._sys.filename,
          title: node.title,
          description: node.description,
          pubDate: node.pubDate,
          heroImage: node.heroImage,
        },
      ];
    }) ?? [];

  return { blogs };
};
