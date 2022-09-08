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
import { defineSchema, defineConfig } from 'tinacms'
import { client } from './__generated__/client'


const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main'
const schema = defineSchema({
  // See https://tina.io/docs/tina-cloud/connecting-site/ for more information about this config
  config: {
    token: '<Your Read Only Token>', // generated on app.tina.io,
    clientId: '<Your Client ID>', // generated on app.tina.io
    branch,
  },
  collections: [
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/posts',
      format: 'mdx',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'rich-text',
          label: 'Blog Post Body',
          name: 'body',
          isBody: true,
          templates: [
            {
              name: 'PageSection',
              label: 'Page Section',
              fields: [
                {
                  type: 'string',
                  name: 'heading',
                  label: 'Heading',
                },
                {
                  type: 'string',
                  name: 'content',
                  label: 'Content',
                  ui: {
                    component: 'textarea',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})

export default schema

// Your tina config

export const tinaConfig = defineConfig({
  client,
  schema,
  cmsCallback: (cms) => {
    //  add your CMS callback code here (if you want)

    // The Route Mapper
    /**
     * 1. Import \`tinacms\` and \`RouteMappingPlugin\`
     **/
    import('tinacms').then(({ RouteMappingPlugin }) => {
      /**
       * 2. Define the \`RouteMappingPlugin\` see https://tina.io/docs/tinacms-context/#the-routemappingplugin for more details
       **/
      const RouteMapping = new RouteMappingPlugin((collection, document) => {
        return undefined
      })
      /**
       * 3. Add the \`RouteMappingPlugin\` to the \`cms\`.
       **/
      cms.plugins.add(RouteMapping)
    })

    return cms
  },
})

`

export const defaultStaticConfig = ({
  preset,
}: {
  preset: 'nextjs' | 'hugo'
}) => {
  let collectionUi: string = ''
  if (preset === 'nextjs') {
    collectionUi = `
        ui:{
          router: ({document}) => {
            // Tell Tina where you
            return \`demo/blog/\${document._sys.filename}\`
          }
        },`
  }
  return `import { defineStaticConfig } from 'tinacms'

const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main'

export default defineStaticConfig({
  // See https://tina.io/docs/tina-cloud/connecting-site/ for more information about this config
  token: '<Your Read Only Token>', // generated on app.tina.io,
  clientId: '<Your Client ID>', // generated on app.tina.io
  branch,
  build: {
    publicFolder: "public",
    outputFolder: "admin"
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads"
    }
  },
  schema: {
    collections: [
      {
        label: 'Blog Posts',
        name: 'post',
        path: 'content/posts',
        format: 'mdx',${collectionUi}
        fields: [
          {
            type: 'string',
            label: 'Title',
            name: 'title',
          },
          {
            type: 'rich-text',
            label: 'Blog Post Body',
            name: 'body',
            isBody: true,
            templates: [
              {
                name: 'PageSection',
                label: 'Page Section',
                fields: [
                  {
                    type: 'string',
                    name: 'heading',
                    label: 'Heading',
                  },
                  {
                    type: 'string',
                    name: 'content',
                    label: 'Content',
                    ui: {
                      component: 'textarea',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
})
`
}
