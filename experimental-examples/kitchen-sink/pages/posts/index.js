import { getStaticPropsForTina } from 'tinacms'
import { Layout } from '../../components/Layout'
import Link from 'next/link'
export default function Home(props) {
  const postsList = props.data.postConnection.edges
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
  const tinaProps = await getStaticPropsForTina({
    query: `{
        postConnection{
          edges {
            node {
              id
              _sys {
                filename
              }
            }
          }
        }
      }`,
    variables: {},
  })

  return {
    props: {
      ...tinaProps,
    },
  }
}
