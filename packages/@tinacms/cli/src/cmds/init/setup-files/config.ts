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

export const configExamples = {
  next: () => `import { defineStaticConfig } from 'tinacms'

  // Your hosting provider likely exposes this as an environment variable
  const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main'
  
  export default defineStaticConfig({
    branch,
    clientId: null, // Get this from tina.io
    token: null, // Get this from tina.io
    build: {
      outputFolder: 'admin',
      publicFolder: 'public',
    },
    media: {
      tina: {
        mediaRoot: 'uploads',
        publicFolder: 'public',
      },
    },
    schema: {
      collections: [
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
      ],
    },
  })
  `,
  other: (args: { publicFolder: string }) => {
    return `
  import { defineStaticConfig } from "tinacms";
  
  // Your hosting provider likely exposes this as an environment variable
  const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";
  
  export default defineStaticConfig({
    branch,
    clientId: null,   // Get this from tina.io
    token: null,      // Get this from tina.io
    build: {
      outputFolder: "admin",
      publicFolder: "${args.publicFolder}",
    },
    media: {
      tina: {
        mediaRoot: "uploads",
        publicFolder: "${args.publicFolder}",
      },
    },
    schema: {
      collections: [
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
            },
            {
              type: "rich-text",
              name: "body",
              label: "Body",
              isBody: true,
            },
          ],
        },
      ],
    },
  });
  `
  },
}
