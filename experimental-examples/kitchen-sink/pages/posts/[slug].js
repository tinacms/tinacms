import { staticRequest } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Layout } from '../../components/Layout'
import { ExperimentalGetTinaClient } from '../../tina/__generated__/types.ts'

export default function Home(props) {
  return (
    <Layout>
      <code>
        <pre
          style={{
            backgroundColor: 'lightgray',
          }}
        >
          {JSON.stringify(props.data.post, null, 2)}
        </pre>
      </code>
      <TinaMarkdown content={props.data.post.body} />
    </Layout>
  )
}

export const getStaticPaths = async () => {
  const tinaProps = await staticRequest({
    query: `{
        postConnection {
          edges {
            node {
              _sys {
                filename
              }
            }
          }
        }
      }`,
    variables: {},
  })
  const paths = tinaProps.postConnection.edges.map((x) => {
    return { params: { slug: x.node._sys.filename } }
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

  const res = await client.post(variables)

  return {
    props: {
      data: res.data,
      query: res.query,
      variables: res.variables,
    },
  }
}
