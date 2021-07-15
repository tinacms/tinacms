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
import type { Posts_Document } from '../../.tina/__generated__/types'
import { Wrapper } from '../../components/helper-components'
import { LocalClient } from 'tina-graphql-gateway'

// Use the props returned by get static props
export default function BlogPostPage(
  props: AsyncReturnType<typeof getStaticProps>['props']
) {
  return (
    <>
      <Wrapper data={props.data.getPostsDocument.data}>
        <BlogPost {...props.data.getPostsDocument.data} />
      </Wrapper>
    </>
  )
}

export const query = `#graphql
  query BlogPostQuery($relativePath: String!) {
    getPostsDocument(relativePath: $relativePath) {
      data {
        __typename
        ... on Article_Doc_Data {
          title
          hero
          author {
            data {
              ... on Author_Doc_Data {
                name
                avatar
              }
            }
          }
          _body
        }
      }
    }
  }
`

const client = new LocalClient()

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: `${params.filename}.md` }
  return {
    props: {
      data: await client.request<{ getPostsDocument: Posts_Document }>(query, {
        variables,
      }),
      variables,
      query,
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
  const postsListData = await client.request<{
    getPostsList: Posts_Document[]
  }>(
    (gql) => gql`
      {
        getPostsList {
          sys {
            filename
          }
        }
      }
    `,
    { variables: {} }
  )
  return {
    paths: postsListData.getPostsList.map((post) => ({
      params: { filename: post.sys.filename },
    })),
    fallback: false,
  }
}

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any
