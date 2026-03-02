import client from '@/tina/__generated__/client'
import Layout from '@/components/layout/layout'
import BlogClientPage from './client-page'

type Props = { params: Promise<{ filename: string }> }

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
    <Layout rawPageData={tinaProps}>
      <BlogClientPage {...tinaProps} />
    </Layout>
  )
}
