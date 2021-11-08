import { getStaticPropsForTina } from 'tinacms'
export default function Home(props) {
  const postsList = props.data.getPostList.edges
  return (
    <div>
      <h1>Posts</h1>
      <div>
        {postsList.map((post) => (
          <div key={post.node.id}>{post.node.sys.filename}</div>
        ))}
      </div>
    </div>
  )
}

export const getStaticProps = async () => {
  const tinaProps = await getStaticPropsForTina({
    query: `{
        getPostList{
          edges {
            node {
              id
              sys {
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

export const getStaticProps = async () => {
  const tinaProps = await getStaticPropsForTina({
    query: `{
      getPageDocument(relativePath: "home.mdx"){
        data{
          body
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
