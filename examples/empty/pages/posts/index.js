import Link from 'next/link';
import { useTina } from 'tinacms/react';
import client from '../../tina/__generated__/client';

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
}`;

export default function PostsIndex(props) {
  const { data } = useTina({
    query,
    variables: {},
    data: props.data,
  });

  const postsList = data?.postConnection?.edges;
  return (
    <>
      <h1>Posts</h1>
      <div>
        {postsList?.map((post) => (
          <div key={post.node.id}>
            <Link href={`/posts/${post.node._sys.filename}`}>
              {post.node._sys.filename}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

export const getStaticProps = async () => {
  let data = {};
  const variables = {};
  try {
    const response = await client.request({ query, variables });
    data = response.data;
  } catch {
    // swallow errors related to document creation
  }

  return {
    props: {
      query,
      variables,
      data,
    },
  };
};
