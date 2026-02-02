import { useTina } from 'tinacms/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import client from '../../tina/__generated__/client';

const query = `query getPost($relativePath: String!) {
  post(relativePath: $relativePath) {
    title
    body
  }
}`;

export default function PostPage(props) {
  const { data } = useTina({
    query,
    variables: props.variables,
    data: props.data,
  });

  return (
    <div>
      <h1>{data?.post?.title}</h1>
      <TinaMarkdown content={data?.post?.body} />
    </div>
  );
}

export const getStaticPaths = async () => {
  const postsResponse = await client.request({
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
  });
  const paths = postsResponse.data.postConnection.edges.map((x) => {
    return { params: { slug: x.node._sys.filename } };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps = async (ctx) => {
  const variables = {
    relativePath: ctx.params.slug + '.md',
  };
  let data = {};
  try {
    const response = await client.request({ query, variables });
    data = response.data;
  } catch (error) {
    // swallow errors related to document creation
  }

  return {
    props: {
      data,
      query,
      variables,
    },
  };
};
