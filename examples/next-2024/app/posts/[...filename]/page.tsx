import client from '@/tina/__generated__/client'
import Post from './client-page'

export async function generateStaticParams() {
  const pages = await client.queries.postConnection()
  const paths = pages.data?.postConnection?.edges?.map((edge) => ({
    filename: edge?.node?._sys.breadcrumbs,
  }))

  return paths || []
}

export default async function PostPage({
  params,
}: {
  params: { filename: string[] }
}) {
  const data = await client.queries.post({
    relativePath: `${params.filename}.md`,
  })

  return <Post {...data} />
}
