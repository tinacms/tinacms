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

import { defineSchema, defineConfig } from 'tinacms'
import { client } from './__generated__/client'

const schema = defineSchema({
  config: {
    branch: 'foo',
    clientId: 'some-client-id',
    token: 'some-token',
    media: {
      tina: {
        mediaRoot: 'public',
        publicFolder: 'images',
      },
    },
  },
  collections: [
    {
      name: 'test',
      path: 'content/test',
      label: 'Test',
      templates: [
        {
          name: 'tem1',
          label: 'Template 1',
          fields: [{ type: 'string', name: 'foo' }],
        },
        {
          name: 'tem2',
          label: 'Template 2',
          fields: [{ type: 'string', name: 'bar' }],
        },
      ],
    },
    {
      name: 'page',
      path: 'content/page',
      label: 'Page',
      format: 'mdx',

      // An example of a defaultItem
      // defaultItem: () => {
      //   const m = new Date()
      //   return {
      //     title: 'New Page',
      //     test: 'This is a default value of the test field',
      //     filename: `new-page-${
      //       m.getUTCFullYear() +
      //       '-' +
      //       (m.getUTCMonth() + 1) +
      //       '-' +
      //       m.getUTCDate()
      //     }`,
      //   }
      // },
      fields: [
        {
          label: 'Title',
          name: 'Title',
          type: 'string',
          ui: {
            // Examples of how you COULD use a custom form
            // component: ({ form, field, input }) => {
            //   return (
            //     <div>
            //       <label>This is a test</label>
            //       <input {...input}></input>
            //     </div>
            //   )
            // },
            // validate: (val) => {
            //   if (val?.length > 5) {
            //     return 'Too Long!!!'
            //   }
            // },
          },
        },
        {
          label: 'Test',
          name: 'test',
          type: 'string',
          description: 'This is a test',
        },
        {
          name: 'body',
          label: 'Main Content',
          type: 'rich-text',
          isBody: true,
        },
      ],
    },
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/post',
      format: 'md',
      defaultItem: () => {
        return {
          title: 'new post',
          filename: 'new-post',
          date: new Date().toISOString(),
          foo: { bar: 'bar' },
        }
      },
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'datetime',
          label: 'Date',
          name: 'date',
        },
        {
          type: 'object',
          name: 'foo',
          label: 'Foo',
          fields: [{ name: 'bar', label: 'Bar', type: 'string' }],
        },
        {
          type: 'object',
          label: 'Related Posts',
          name: 'posts',
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.label }
            },
          },
          fields: [
            {
              name: 'post',
              type: 'reference',
              collections: ['post', 'page'],
            },
            {
              name: 'label',
              type: 'string',
            },
          ],
        },
        {
          type: 'string',

          label: 'Topic',
          name: 'topic',
          options: ['programming', 'blacksmithing'],
          list: true,
        },
        {
          type: 'rich-text',
          label: 'Blog Post Body',
          name: 'body',
          isBody: true,
          templates: [
            {
              name: 'Gallery',
              label: 'Gallery',
              fields: [
                {
                  label: 'Images',
                  name: 'images',
                  type: 'object',
                  list: true,
                  fields: [
                    {
                      type: 'image',
                      name: 'src',
                      label: 'Source',
                    },
                    {
                      type: 'string',
                      name: 'width',
                      label: 'Width',
                    },
                    {
                      type: 'string',
                      name: 'height',
                      label: 'Height',
                    },
                  ],
                },
                {
                  type: 'string',
                  name: 'alignment',
                  label: 'Alignment',
                  options: ['left', 'center', 'right'],
                },
                {
                  type: 'string',
                  name: 'gap',
                  label: 'Gap',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
})

export const tinaConfig = defineConfig({
  schema,
  client,
})

export default schema
