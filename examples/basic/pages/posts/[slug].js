import { client } from '../../.tina/__generated__/client'
import { Layout } from '../../components/Layout'
import { useTina } from 'tinacms/dist/edit-state'

const query = `query getPost($relativePath: String!) {
  post(relativePath: $relativePath) {
    title
    body
    posts {
      __typename
      ... on PostPosts {
        post {
          __typename
          ... on Post {
            title
            body
          }
        }
      }
    }
  }
}
`

export default function Home(props) {
  const { data } = useTina({
    query,
    variables: props.variables,
    data: props.data,
  })

  return (
    <Layout>
      <code>
        <pre
          style={{
            backgroundColor: 'lightgray',
          }}
        >
          {JSON.stringify(data.post, null, 2)}
        </pre>
      </code>
    </Layout>
  )
}

export const getStaticPaths = async () => {
  const tinaProps = await client.request({
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
  const paths = tinaProps.data.postConnection.edges.map((x) => {
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
  const { data } = await client.request({
    query,
    variables,
  })

  return {
    props: {
      data,
      query,
      variables,
    },
  }
}
