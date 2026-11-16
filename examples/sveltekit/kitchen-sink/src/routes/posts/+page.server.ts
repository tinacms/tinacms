import client from '#tina/__generated__/client.ts';
export const prerender = true;

export async function load() {
  const postsResponse = await client.queries.postConnection({ first: 1000 });
  const posts =
    postsResponse.data.postConnection.edges?.flatMap((edge) => {
      const node = edge?.node;
      if (!node) return [];
      const slug = node._sys.breadcrumbs.join('/');
      return [{ slug, title: node.title }];
    }) ?? [];

  return { posts };
}
