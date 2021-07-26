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
_template: article
---

This is your first post!
`

export const nextPostPage = ({ wrapper = false }: { wrapper: boolean }) => `
import { LocalClient } from "tinacms";
import type {
  PostsConnection,
  PostsDocument,
} from "../../../.tina/__generated__/types";

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

// Use the props returned by get static props (this can be deleted when the edit provider and tina-wrapper are moved to _app.js)
${
  wrapper
    ? `export default function BlogPostPageWrapper(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  return (
    // TODO: Move edit provider and Tina provider to _app.js
    // your whole app should be wrapped in the lightweight edit provider
    <EditProvider>
      {/* When in edit mode your site should be wrapped in this Tina Wrapper */}
      <TinaWrapper {...props}>
        {(props) => {
          return <BlogPage {...props} />;
        }}
      </TinaWrapper>
    </EditProvider>
  );
}

// This will become the default export
`
    : ''
}
const BlogPage = (props: AsyncReturnType<typeof getStaticProps>["props"]) => {
  return (
    <div>
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h1>{props.data.getPostsDocument.data.title}</h1>
        <div>{props.data.getPostsDocument.data.body}</div>
      </div>
      {/* you can delete this iframe (and page) once you are done getting started */}
      <iframe
        style={{ height: "80vh", width: "100%", border: "none" }}
        src="https://tina.io/docs/tina-init-tutorial/?layout=false"
      ></iframe>
    </div>
  );
};

export const query = \`#graphql
query BlogPostQuery($relativePath: String!) {
  getPostsDocument(relativePath: $relativePath) {
    data {
      title
      body
    }
  }
}
\`;

const client = new LocalClient();

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: \`\${params.filename}.md\` };
  return {
    props: {
      data: await client.request<{ getPostsDocument: PostsDocument }>(query, {
        variables,
      }),
      variables,
      query,
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
  const postsListData = await client.request<{
    getPostsList: PostsConnection;
  }>(
    (gql) => gql\`
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
    \`,
    { variables: {} }
  );
  return {
    paths: postsListData.getPostsList.edges.map((post) => ({
      params: { filename: post.node.sys.filename },
    })),
    fallback: false,
  };
};

${wrapper ? '' : 'export default BlogPage'}
`

export const TinaWrapper = `
import { TinaCloudProvider, useGraphqlForms } from "tinacms";

const TinaWrapper = (props) => {
  return (
    <TinaCloudProvider
      clientId={process.env.NEXT_PUBLIC_TINA_CLIENT_ID}
      branch={process.env.NEXT_PUBLIC_EDIT_BRACH}
      organization={process.env.NEXT_PUBLIC_ORGANIZATION_NAME}
      isLocalClient={Boolean(
        Number(process.env.NEXT_PUBLIC_USE_LOCAL_CLIENT ?? true)
      )}
    >
      <Inner {...props} />
    </TinaCloudProvider>
  );
};

const Inner = (props) => {
  const [payload, isLoading] = useGraphqlForms({
    query: (gql) => gql(props.query),
    variables: props.variables || {},
  });
  return (
    <>
      {isLoading ? (
        <>
          <div>Loading</div>
          <div
            style={{
              pointerEvents: "none",
            }}
          >
            {props.children(props)}
          </div>
        </>
      ) : (
        // pass the new edit state data to the child
        props.children({ ...props, data: payload })
      )}
    </>
  );
};

export default TinaWrapper;

`

export const AppJsContent = `import dynamic from "next/dynamic";

import { EditProvider, useEditState } from "tinacms/dist/edit-state";

// InnerApp that handles rendering edit mode or not
function InnerApp({ Component, pageProps }) {
  const { edit } = useEditState();
  if (edit && pageProps.query) {
    // Dynamically load Tina only when in edit mode so it does not affect production
    // see https://nextjs.org/docs/advanced-features/dynamic-import#basic-usage
    const TinaWrapper = dynamic(() => import("../components/tina-wrapper"));
    return (
      <>
        <TinaWrapper {...pageProps}>
          {(props) => <Component {...props} />}
        </TinaWrapper>
      </>
    );
  }
  return <Component {...pageProps} />;
}

// Our app is wrapped with edit provider
function App(props) {
  return (
    <EditProvider>
      <ToggleButton />
      <InnerApp {...props} />
    </EditProvider>
  );
}
const ToggleButton = () => {
  const { edit, setEdit } = useEditState();
  return (
    <button
      onClick={() => {
        setEdit(!edit);
      }}
    >
      Toggle Edit State
    </button>
  );
};

export default App;`
