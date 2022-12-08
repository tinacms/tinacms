import { defineConfig } from 'tinacms'

export default defineConfig({
  admin: {
    auth: {
      onLogin: () => {
        // Your Login Logic Goes Here
      },
    },
  },
  branch: '',
  clientId: null,
  token: null,
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
        name: 'dummy',
        path: 'content',
        label: 'Test',
        templates: [
          {
            name: 'tem2',
            label: 'Template 2',
            fields: [{ type: 'string', name: 'bar' }],
          },
        ],
      },
      {
        name: 'test',
        path: 'content/test',
        label: 'Test',
        templates: [
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
        fields: [
          {
            label: 'Title',
            name: 'Title',
            type: 'string',
            ui: {
              // defaultValue: 'Title',
              // Examples of how you COULD use a custom form
              // component: ({ form, field, input }) => {
              //   return (
              //     <div>
              //       <label>
              //         This is a test React
              //       </label>
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
            name: 'body',
            label: 'Body',
            type: 'rich-text',
            isBody: true,
            templates: [
              {
                name: 'WarningCallout',
                label: 'WarningCallout',
                match: {
                  start: '{%',
                  end: '%}',
                },
                fields: [
                  {
                    name: 'text',
                    label: 'Text',
                    type: 'string',
                    required: true,
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
      {
        label: 'Blog Posts',
        name: 'post',
        path: 'content/post',
        format: 'md',
        ui: {
          router: ({ document }) => {
            return `/posts/${document._sys.filename}`
          },
        },
        fields: [
          {
            type: 'string',
            label: 'Title',
            name: 'title',
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
            type: 'object',
            label: 'Something',
            name: 'foo',
            fields: [
              {
                name: 'bar',
                label: 'Bar',
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
  },
})
