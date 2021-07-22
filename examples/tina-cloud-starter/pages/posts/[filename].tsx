/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { BlogPost } from '../../components/post'
import { Wrapper } from '../../components/helper-components'
import { staticRequest, gql, getStaticPropsForTina } from 'tinacms'

// Use the props returned by get static props
export default function BlogPostPage(props: any) {
  return (
    <>
      <Wrapper data={props.data.getPostsDocument.data}>
        <BlogPost {...props.data.getPostsDocument.data} />
      </Wrapper>
    </>
  )
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = await getStaticPropsForTina({
    query: gql`
      query GetPostDocument($relativePath: String!) {
        getPostsDocument(relativePath: $relativePath) {
          data {
            title
            hero
            body
            author {
              __typename
              ... on AuthorsDocument {
                data {
                  name
                  avatar
                }
              }
            }
          }
        }
      }
    `,
    variables: { relativePath: `${params.filename}.md` },
  })
  return {
    props: {
      ...tinaProps,
    },
  }
}

/**
 * To build the blog post pages we just iterate through the list of
 * posts and provide their "filename" as part of the URL path
 *
 * So a blog post at "content/posts/hello.md" would
 * be viewable at http://localhost:3000/posts/hello
 */
export const getStaticPaths = async () => {
  const postsListData = (await staticRequest({
    query: gql`
      query GetPostsList {
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
  })) as any

  return {
    paths: postsListData.getPostsList.edges.map((post) => ({
      params: { filename: post.node.sys.filename },
    })),
    fallback: false,
  }
}
