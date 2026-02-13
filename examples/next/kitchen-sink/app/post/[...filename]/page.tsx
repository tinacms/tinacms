import client from '@/tina/__generated__/client'
import BlogPostClientPage from './client-page'

type Props = { params: Promise<{ filename?: string[] }> }

export async function generateStaticParams() {
  const pages = await client.queries.postConnection()
  const paths = pages.data?.postConnection?.edges?.flatMap((edge) => {
    const breadcrumbs = edge?.node?._sys?.breadcrumbs
    return breadcrumbs ? [{ filename: breadcrumbs }] : []
  })

  return paths || []
}

export default async function PostFile({ params }: Props) {
  const { filename } = await params
  const parts = filename || []
  const relativePath = `${parts.join('/')}.mdx`
  const tinaProps = await client.queries.post({ relativePath })

  return <BlogPostClientPage {...tinaProps} />
}
