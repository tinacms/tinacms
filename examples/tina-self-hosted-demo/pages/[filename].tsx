import { Blocks } from '../components/blocks-renderer'
import { useTina } from 'tinacms/dist/react'
import { Layout } from '../components/layout'
import databaseClient from '../tina/__generated__/backendClient'

export default function HomePage(
  props: AsyncReturnType<typeof getStaticProps>['props']
) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })
  return (
    <Layout rawData={data} data={data.global as any}>
      <Blocks {...data.page} />
    </Layout>
  )
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = await databaseClient.queries.contentQuery({
    relativePath: `${params.filename}.md`,
  })
  return {
    props: {
      data: tinaProps.data,
      query: tinaProps.query,
      variables: tinaProps.variables,
    },
  }
}

export const getStaticPaths = async () => {
  const pagesListData = await databaseClient.queries.pageConnection()
  return {
    paths: pagesListData.data.pageConnection.edges.map((page) => ({
      params: { filename: page.node._sys.filename },
    })),
    fallback: false,
  }
}

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any
