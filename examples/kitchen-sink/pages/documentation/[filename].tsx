import { InferGetStaticPropsType } from 'next'
import { Json } from '../../components/json'
import { useTina } from 'tinacms/dist/react'
import client from '../../tina/__generated__/client'
import { expandWithMetadata } from '@tinacms/preview-helpers'
import {
  previewField,
  useEditOpen,
  useEditDemo,
} from '@tinacms/preview-helpers/dist/react'

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const { data } = useTina(props)
  useEditOpen('/admin')
  useEditDemo()
  return (
    <div className="mx-auto max-w-4xl p-4 shadow-lg rounded-md">
      <h1 data-vercel-edit-info={previewField(data.documentation, 'title')}>
        {data.documentation.title}
      </h1>
    </div>
  )
  // return <Json src={data} />
}

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: `${params.filename}.md` }
  let props = await client.queries.documentation(variables)

  // if (process.env.VERCEL_ENV === 'preview') {
  props = await expandWithMetadata(props, client)
  // }
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
