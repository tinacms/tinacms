import client from '@/tina/__generated__/client'
import { formatDate } from '@/lib/utils'
import BlogClientPage from './client-page'

type Props = { params: Promise<{ filename: string }> }

export const revalidate = 300

export async function generateStaticParams() {
  const pages = await client.queries.blogConnection()
  const paths = pages.data?.blogConnection?.edges?.map((edge) => ({
    filename: edge?.node?._sys?.filename,
  }))

  return paths || []
}

export default async function BlogFile({ params }: Props) {
  const { filename } = await params
  const relativePath = `${filename}.mdx`
  const tinaProps = await client.queries.blog({ relativePath })

  return (
    <BlogClientPage
      {...tinaProps}
      formattedPubDate={formatDate(tinaProps.data?.blog?.pubDate)}
      formattedUpdatedDate={formatDate(tinaProps.data?.blog?.updatedDate)}
    />
  )
}
