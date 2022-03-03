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

export const defaultSchema = `
import { defineSchema, defineConfig } from "tinacms";

export default defineSchema({
  collections: [
    {
      label: "Blog Posts",
      name: "posts",
      path: "content/posts",
      fields: [
        {
          type: "string",
          label: "Title",
          name: "title",
        },
        {
          type: "string",
          label: "Blog Post Body",
          name: "body",
          isBody: true,
          ui: {
            component: "textarea"
          },
        },
      ],
    },
  ],
});




// Your tina config
// ==============
const branch = 'main'
// When working locally, hit our local filesystem.
// On a Vercel deployment, hit the Tina Cloud API
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : \`https://content.tinajs.io/content/\${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/\${branch}\`

export const tinaConfig = defineConfig({
  apiURL,
  cmsCallback: (cms) => {
    //  add your CMS callback code here (if you want)

    // The Route Mapper
    /**
     * 1. Import \`tinacms\` and \`RouteMappingPlugin\`
     **/
    import("tinacms").then(({ RouteMappingPlugin }) => {
      /**
       * 2. Define the \`RouteMappingPlugin\` see https://tina.io/docs/tinacms-context/#the-routemappingplugin for more details
       **/
      const RouteMapping = new RouteMappingPlugin((collection, document) => {
        return undefined;
      });
      /**
       * 3. Add the \`RouteMappingPlugin\` to the \`cms\`.
       **/
      cms.plugins.add(RouteMapping);
    });
  },
});
`
