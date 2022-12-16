import { InferGetStaticPropsType } from 'next'
import { Json } from '../../components/json'
import { useTina } from 'tinacms/dist/react'
import client from '../../.tina/__generated__/client'

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina(props)

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          window?.parent?.postMessage(
            { type: 'setActiveField', field: 'title' },
            window?.location?.origin
          )
        }}
      >
        Click me
      </button>
      <button
        onClick={(e) => {
          e.preventDefault()
          window?.parent?.postMessage(
            { type: 'updateData', field: 'title', data: 'This is a test!' },
            window.location.origin
          )
        }}
      >
        Click me to update title
      </button>
      <Json src={data} />
    </>
  )
}

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: `${params.filename}.md` }
  const props = await client.queries.page(variables)
  return {
    props: { ...props, variables },
  }
}

export const getStaticPaths = async () => {
  const connection = await client.queries.pageConnection()
  return {
    paths: connection.data.pageConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename },
    })),
    fallback: 'blocking',
  }
}
