import { Author } from '../../components/authors/author'
import { useTina } from 'tinacms/dist/react'
import { Layout } from '../../components/layout'
import databaseClient from '../../tina/__generated__/databaseClient'

// Use the props returned by get static props
export default function AuthorPage(
  props: AsyncReturnType<typeof getStaticProps>['props']
) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })
  if (data && data.author) {
    return (
      <Layout rawData={data} data={data.global as any}>
        <Author data={data.author} />
      </Layout>
    )
  }
  return (
    <Layout>
      <div>No data</div>;
    </Layout>
  )
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = await databaseClient.queries.authorQuery({
    relativePath: `${params.filename}.md`,
  })
  return {
    props: {
      ...tinaProps,
    },
  }
}

/**
 * To build the author pages we just iterate through the list of
 * authors and provide their "filename" as part of the URL path
 *
 * So a author at "content/posts/pedro.md" would
 * be viewable at http://localhost:3000/authors/pedro
 */
export const getStaticPaths = async () => {
  const authorListData = await databaseClient.queries.authorConnection()
  return {
    paths: authorListData.data.authorConnection.edges.map((author) => ({
      params: { filename: author.node._sys.filename },
    })),
    fallback: 'blocking',
  }
}

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any
