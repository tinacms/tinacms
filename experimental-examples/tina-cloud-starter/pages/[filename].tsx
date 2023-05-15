import { InferGetStaticPropsType } from 'next'
import { Blocks } from '../components/blocks-renderer'
import { useTina } from 'tinacms/dist/react'
import { Layout } from '../components/layout'
import { client } from '../.tina/__generated__/client'
import React from 'react'
import { withSourceMap, withSourceMaps } from '@tinacms/vercel-previews'
import { encodeAtPath } from '../.tina/config'

export default function HomePage(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const [enabledPreview, setPreviewEnabled] = React.useState(false)
  // const { data } = props
  const { data } = useTina(props, {
    redirect: '/admin',
    quickEditEnabled: enabledPreview,
  })
  // const dataWithEncodedMetadata = useEncodeMetadata(data)
  return (
    <Layout rawData={data} data={data.global as any}>
      <button
        className="absolute bottom-2 right-2 p-4 rounded-sm bg-blue-500 text-white z-40"
        onClick={() => setPreviewEnabled((preview) => !preview)}
      >
        Toggle Preview
      </button>
      <Blocks {...data.page} />
    </Layout>
  )
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = await client.queries.contentQuery({
    relativePath: `${params.filename}.md`,
  })
  return {
    props: withSourceMaps(
      {
        data: tinaProps.data,
        query: tinaProps.query,
        variables: tinaProps.variables,
      },
      { encodeStrings: true, encodeAtPath }
    ),
  }
}

export const getStaticPaths = async () => {
  const pagesListData = await client.queries.pageConnection()
  return {
    paths: pagesListData.data.pageConnection.edges.map((page) => ({
      params: { filename: page.node._sys.filename },
    })),
    fallback: false,
  }
}
