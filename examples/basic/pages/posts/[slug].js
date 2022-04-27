import { staticRequest } from 'tinacms'
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
  let data = {}
  try {
    data = await staticRequest({
      query,
      variables,
    })
  } catch (error) {
    // swallow errors related to document creation
  }

  return {
    props: {
      data,
      query,
      variables,
    },
  }
}
