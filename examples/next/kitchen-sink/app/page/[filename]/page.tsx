import client from '../../../tina/__generated__/client'
import PageClientComponent from './client-page'

type Props = { params: Promise<{ filename: string }> }

export async function generateStaticParams() {
  const connection = await client.queries.pageConnection()
  return connection.data?.pageConnection?.edges?.map((post: any) => ({
    filename: post.node._sys.filename,
  })) || []
}

export default async function PageFile({ params }: Props) {
  const { filename } = await params
  const relativePath = `${filename}.md`
  const tinaProps = await client.queries.page({ relativePath })

  return (
    <PageClientComponent
      query={tinaProps.query}
      variables={tinaProps.variables}
      data={JSON.parse(JSON.stringify(tinaProps.data))}
    />
  )
}
