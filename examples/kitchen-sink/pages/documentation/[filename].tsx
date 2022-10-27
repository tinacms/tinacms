import { InferGetStaticPropsType } from 'next'
import { Json } from '../../components/json'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import client from '../../.tina/__generated__/client'
import ReactDOM from 'react-dom'

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina(props)

  // return (
  //   <div className="mx-4 border rounded-lg p-8 shadow-lg prose">
  //     <TinaMarkdown content={data.documentation.body} />
  //   </div>
  // )

  return <Json src={data} />
}

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: `${params.filename}.md` }
  const props = await client.queries.documentation(variables)
  return {
    props: { ...props, variables },
  }
}

export const getStaticPaths = async () => {
  const connection = await client.queries.documentationConnection()
  return {
    paths: connection.data.documentationConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename },
    })),
    fallback: 'blocking',
  }
}
