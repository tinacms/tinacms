import client from '@/tina/__generated__/client'
import PageContent from './client-page'

export async function generateStaticParams() {
  const pages = await client.queries.pageConnection()
  const paths = pages.data?.pageConnection?.edges?.map((edge) => ({
    slug: edge?.node?._sys.filename,
  }))

  return paths || []
}

export default async function Page({
  params,
}: {
  params: { slug: string }
}) {
  const data = await client.queries.page({
    relativePath: `${params.slug}.mdx`,
  })

  return <PageContent {...data} />
}
