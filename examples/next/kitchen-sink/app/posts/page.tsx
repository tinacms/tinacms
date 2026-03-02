import Layout from '@/components/layout/layout'
import client from '@/tina/__generated__/client'
import PostsClientPage from './client-page'

export const revalidate = 300

export default async function PostsPage() {
  let posts = await client.queries.postConnection({
    first: 20,
  })
  const allPosts = posts

  if (!allPosts.data.postConnection.edges) {
    return (
      <Layout>
        <div className="py-12 text-center text-gray-500">No posts found</div>
      </Layout>
    )
  }

  while (posts.data?.postConnection.pageInfo.hasNextPage) {
    posts = await client.queries.postConnection({
      first: 20,
      after: posts.data.postConnection.pageInfo.endCursor,
    })

    if (!posts.data.postConnection.edges) {
      break
    }

    allPosts.data.postConnection.edges.push(
      ...posts.data.postConnection.edges
    )
  }

  return (
    <Layout rawPageData={allPosts.data}>
      <PostsClientPage {...allPosts} />
    </Layout>
  )
}
