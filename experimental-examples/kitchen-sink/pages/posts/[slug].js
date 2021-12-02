import { staticRequest } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Layout } from '../../components/Layout'
import { ExperimentalGetTinaClient } from '../../.tina/__generated__/types.ts'

export default function Home(props) {
  return (
    <Layout>
      <code>
        <pre
          style={{
            backgroundColor: 'lightgray',
          }}
        >
          {JSON.stringify(props.data.getPostDocument.data, null, 2)}
        </pre>
      </code>
      <TinaMarkdown content={props.data.getPostDocument.data.body} />
    </Layout>
  )
}

export const getStaticPaths = async () => {
  const tinaProps = await staticRequest({
    query: `{
        getPostList{
          edges {
            node {
              sys {
                filename
              }
            }
          }
        }
      }`,
    variables: {},
  })
  const paths = tinaProps.getPostList.edges.map((x) => {
    return { params: { slug: x.node.sys.filename } }
  })

  return {
    paths,
    fallback: 'blocking',
  }
}
export const getStaticProps = async (ctx) => {
  const variables = {
    relativePath: ctx.params.slug + '.md',
  }
  const client = ExperimentalGetTinaClient()

  const res = await client.getPostDocument(variables)

  return {
    props: {
      data: res.data,
      query: res.query,
      variables: res.variables,
    },
  }
}
