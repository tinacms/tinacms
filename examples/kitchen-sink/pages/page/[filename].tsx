import React from 'react'
import { InferGetStaticPropsType } from 'next'
import { Json } from '../../components/json'
import { useTina } from 'tinacms/dist/react'
import client from '../../tina/__generated__/client'

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina(props)

  return (
    <div>
      <ClientLoadExample />
      <Json src={data} />
    </div>
  )
}

const ClientLoadExample = () => {
  const [payload, setPayload] = React.useState()
  const [showAuthor, setShowAuthor] = React.useState(false)

  React.useEffect(() => {
    client.queries.author({ relativePath: 'pedro.md' }).then((res) => {
      setPayload(res)
    })
  }, [])
  if (!showAuthor) {
    return (
      <button
        type="button"
        onClick={() => setShowAuthor((showAuthor) => !showAuthor)}
      >
        Toggle Author
      </button>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowAuthor((showAuthor) => !showAuthor)}
      >
        Toggle Author
      </button>
      <ClientLoadAuthor {...payload} />
    </div>
  )
}

const ClientLoadAuthor = (props) => {
  const { data } = useTina(props)
  return <Json src={data} />
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
