import { staticRequest } from 'tinacms'
import { Layout } from '../../components/Layout'
import Link from 'next/link'
import { useTina } from 'tinacms/dist/edit-state'

const query = `{
  postConnection {
    edges {
      node {
        id
        _sys {
          filename
        }
      }
    }
  }
}`

export default function Home(props) {
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  })
  const postsList = data.postConnection.edges
  return (
    <Layout>
      <h1>Posts</h1>
      <div>
        {postsList.map((post) => (
          <div key={post.node.id}>
            <Link href={`/posts/${post.node._sys.filename}`}>
              <a>{post.node._sys.filename}</a>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export const getStaticProps = async () => {
  let data = {}
  const variables = {}
  try {
    data = await staticRequest({
      query,
      variables,
    })
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      query,
      variables,
      data,
      //myOtherProp: 'some-other-data',
    },
  }
}
