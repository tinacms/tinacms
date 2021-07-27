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

export const adminPage = `import { useEffect } from "react";
import { useRouter } from "next/router";
import { useEditState } from "tinacms/dist/edit-state";

const GoToEditPage = () => {
  const { setEdit } = useEditState();
  const router = useRouter();
  useEffect(() => {
    setEdit(true);
    router.back();
  }, []);
  return <div>Entering edit mode..</div>;
};

export default GoToEditPage;
`

export const blogPost = `---
title: Vote For Pedro
---

This is your first post!
`

export const nextPostPage =
  () => `import { staticRequest, gql, getStaticPropsForTina } from 'tinacms'

// Use the props returned by get static props (this can be deleted when the edit provider and tina-wrapper are moved to _app.js)
const BlogPage = (props) => {
  return (
    <div>
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <h1>{props.data.getPostsDocument.data.title}</h1>
        <div>{props.data.getPostsDocument.data.body}</div>
      </div>
      {/* you can delete this iframe (and page) once you are done getting started */}
      <iframe
        style={{ height: '80vh', width: '100%', border: 'none' }}
        src="https://tina.io/docs/tina-init-tutorial/?layout=false"
      ></iframe>
    </div>
  )
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = await getStaticPropsForTina({
    query: gql\`
      query BlogPostQuery($relativePath: String!) {
        getPostsDocument(relativePath: $relativePath) {
          data {
            title
            body
          }
        }
      }
    \`,
    variables: { relativePath: \`\${params.filename}.md\` },
  })
  return {
    props: {
      ...tinaProps,
    },
  }
}

export const getStaticPaths = async () => {
  const postsListData = (await staticRequest({
    query: gql\`
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
    \`,
  })) as any

  return {
    paths: postsListData.getPostsList.edges.map((post) => ({
      params: { filename: post.node.sys.filename },
    })),
    fallback: false,
  }
}

export default BlogPage
`

export const AppJsContent = `import dynamic from 'next/dynamic'
import { TinaEditProvider } from 'tinacms/dist/edit-state'
const TinaCMS = dynamic(() => import('tinacms'), { ssr: false })

const App = ({ Component, pageProps }) => {
  return (
    <>
      <TinaEditProvider
        editMode={
          <TinaCMS
            clientId={process.env.NEXT_PUBLIC_TINA_CLIENT_ID}
            branch={process.env.NEXT_PUBLIC_EDIT_BRACH}
            organization={process.env.NEXT_PUBLIC_ORGANIZATION_NAME}
            isLocalClient={Boolean(
              Number(process.env.NEXT_PUBLIC_USE_LOCAL_CLIENT ?? true)
            )}
            {...pageProps}
          >
            {(livePageProps) => <Component {...livePageProps} />}
          </TinaCMS>
        }
      >
        <Component {...pageProps} />
      </TinaEditProvider>
    </>
  )
}

export default App
`
