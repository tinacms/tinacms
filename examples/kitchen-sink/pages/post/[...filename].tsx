import { InferGetStaticPropsType } from 'next'
import { Json, Markdown } from '../../components/json'
import { useTina } from 'tinacms/dist/react'
import client from '../../tina/__generated__/client'

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina(props)

  return <Json src={data} />
}

export const getStaticProps = async ({ params }) => {
  const parts: string[] = params.filename
  const variables = { relativePath: `${parts.join('/')}.mdx` }
  const props = await client.queries.post(variables)
  return {
    props: { ...props, variables },
  }
}

export const getStaticPaths = async () => {
  const connection = await client.queries.postConnection()
  return {
    paths: connection.data.postConnection.edges.map((post) => ({
      params: { filename: post.node._sys.breadcrumbs },
    })),
    fallback: 'blocking',
  }
}
