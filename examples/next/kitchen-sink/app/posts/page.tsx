import client from '@/tina/__generated__/client';
import { formatDate } from '@/lib/utils';
import PostsClientPage from './client-page';

export const revalidate = 300;

export default async function PostsPage() {
  const allPosts = await client.queries.postConnection({ first: 1000 });

  if (!allPosts.data.postConnection.edges) {
    return (
      <div className='py-12 text-center text-gray-500'>No posts found</div>
    );
  }

  // Pre-format dates server-side so date-fns is not bundled client-side
  const edgesWithFormattedDates = (
    allPosts.data.postConnection.edges ?? []
  ).map((edge) => {
    if (!edge?.node?.date) return edge;
    return {
      ...edge,
      node: { ...edge.node, formattedDate: formatDate(edge.node.date) },
    };
  });

  const enrichedData = {
    ...allPosts.data,
    postConnection: {
      ...allPosts.data.postConnection,
      edges: edgesWithFormattedDates,
    },
  };

  return (
    <PostsClientPage
      query={allPosts.query}
      variables={allPosts.variables}
      data={enrichedData}
    />
  );
}
