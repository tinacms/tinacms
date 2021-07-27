import { Post } from "../../components/post";
import { getStaticPropsForTina, staticRequest } from "tinacms";
import { layoutQueryFragment } from "../../components/layout";
import type { PostsDocument } from "../../.tina/__generated__/types";

// Use the props returned by get static props
export default function BlogPostPage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  return <Post {...props.data.getPostsDocument} />;
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = (await getStaticPropsForTina({
    query: `#graphql
      query BlogPostQuery($relativePath: String!) {
        ${layoutQueryFragment}
        getPostsDocument(relativePath: $relativePath) {
          data {
            title
            date
            author {
              ... on AuthorsDocument {
                data {
                  name
                  avatar
                }
              }
            }
            heroImg
            _body
          }
        }
      }
    `,
    variables: { relativePath: `${params.filename}.md` },
  })) as { data: { getPostsDocument: PostsDocument } };
  return {
    props: {
      ...tinaProps,
    },
  };
};

/**
 * To build the blog post pages we just iterate through the list of
 * posts and provide their "filename" as part of the URL path
 *
 * So a blog post at "content/posts/hello.md" would
 * be viewable at http://localhost:3000/posts/hello
 */
export const getStaticPaths = async () => {
  const postsListData = (await staticRequest({
    query: `#graphql
      {
        getPostsList {
          edges {
            node {
              sys {
                filename
              }
            }
          }
        }
      }
    `,
  })) as any;
  return {
    paths: postsListData.getPostsList.edges.map((post) => ({
      params: { filename: post.node.sys.filename },
    })),
    fallback: false,
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
