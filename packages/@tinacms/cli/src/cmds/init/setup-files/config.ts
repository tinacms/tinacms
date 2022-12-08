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

import type { AddConfigArgs, Framework } from '..'

const other = (args: AddConfigArgs) => {
  return `
import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: ${
    args.clientId ? `'${args.clientId}'` : 'null'
  }, // Get this from tina.io
  token:  ${args.token ? `'${args.token}'` : 'null'}, // Get this from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "${args.publicFolder}",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "${args.publicFolder}",
    },
  },
  schema: {
    collections: ${
      args.collections ||
      `[
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ]`
    },
  },
});
`
}
type Keys = Framework['name']

export const configExamples: {
  [key in Keys]: (args?: AddConfigArgs) => string
} = {
  next: (args) => `import { defineConfig } from 'tinacms'

  // Your hosting provider likely exposes this as an environment variable
  const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main'
  
  export default defineConfig({
    branch,
    clientId: ${
      args.clientId ? `'${args.clientId}'` : 'null'
    }, // Get this from tina.io
    token:  ${args.token ? `'${args.token}'` : 'null'}, // Get this from tina.io
    build: {
      outputFolder: "admin",
      publicFolder: "${args.publicFolder}",
    },
    media: {
      tina: {
        mediaRoot: "",
        publicFolder: "${args.publicFolder}",
      },
    },
    schema: {
      collections:${
        args.collections ||
        `[
        {
          name: 'post',
          label: 'Posts',
          path: 'content/posts',
          fields: [
            {
              type: 'string',
              name: 'title',
              label: 'Title',
              isTitle: true,
              required: true,
            },
            {
              type: 'rich-text',
              name: 'body',
              label: 'Body',
              isBody: true,
            },
          ],
          ui: {
            // This is an DEMO router. You can remove this to fit your site
            router: ({ document }) => \`/demo/blog/\${document._sys.filename}\`,
          },
        },
      ]`
      },
    },
  })
  `,
  other,
  hugo: other,
  jekyll: other,
}
