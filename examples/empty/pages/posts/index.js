import { staticRequest } from 'tinacms'

import Link from 'next/link'
import { useTina } from 'tinacms/dist/react'

const query = `{
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
}`

export default function Home(props) {
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  })

  const postsList = data?.getPostList?.edges
  return (
    <>
      <h1>Posts</h1>
      <div>
        {postsList?.map((post) => (
          <div key={post.node.id}>
            <Link href={`/posts/${post.node.sys.filename}`}>
              {post.node.sys.filename}
            </Link>
          </div>
        ))}
      </div>
    </>
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
