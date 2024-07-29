import { TinaCMS, defineConfig } from 'tinacms'

export default defineConfig({
  // Example of how you can override the frontend url
  // contentApiUrlOverride: 'http://localhost:3000/api/gql',
  admin: {
    auth: {
      // Get token function examples (can be removed)
      getToken: async () => {
        return {
          id_token: 'Foo',
        }
      },
      // This is called when they want to authenticate a user. For a lot of implementations it just may be redirecting to the login page
      async authenticate() {
        console.log('Authenticating...')
        localStorage.setItem(
          'logan',
          JSON.stringify({ name: 'Logan', role: 'admin' })
        )
        return {}
      },
      async logOut() {
        console.log('logOut...')
        localStorage.removeItem('logan')
        window.location.href = '/'
      },
      async getUser() {
        console.log('getUser...')
        const userStr = localStorage.getItem('logan')
        if (!userStr) {
          return undefined
        } else {
          try {
            return JSON.parse(userStr)
          } catch {
            return null
          }
        }
      },

      // Other methods
      onLogin: () => {
        console.log('Logged in!')
        // hook function to be called when the user logs in
      },
      onLogout: () => {
        console.log('Logged out!')
        // hook function to be called when the user logs out
      },
    },
  },
  branch: '',
  clientId: null,
  token: null,
  build: {
    // can set the host of the vite config here
    // host: true,
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
    accept: ['image/jpeg', 'video/mp4'],
  },
  schema: {
    collections: [
      {
        label: 'Media',
        name: 'media',
        path: 'content/media',
        format: 'csv',
        isSingleFile: true,
        fields: [
          {
            type: 'string',
            label: 'Filename',
            name: 'path',
            uid: true,
            required: true,
          },
          {
            type: 'string',
            label: 'Hash',
            name: 'hash',
          },
        ],
      },
      {
        ui: {
          filename: {
            slugify: (values, meta) => {
              if (meta.template.name === 'tem1') {
                return 'tem1/' + (values?.foo || '')
              }
              if (meta.template.name === 'tem2') {
                return 'tem2/' + (values?.bar || '')
              }
            },
          },
        },
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
        frontmatterFormat: 'toml',
        frontmatterDelimiters: ['+++', '+++'],
        ui: {
          // Example of beforeSubmit
          beforeSubmit: async ({ values, cms, form, tinaForm }) => {
            return {
              ...values,
              lastUpdated: new Date().toISOString(),
            }
          },
        },
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
            name: 'lastUpdated',
            type: 'datetime',
            ui: {
              component: 'hidden',
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
        label: 'Blog 2',
        name: 'post2',
        path: 'content/new-folder-2',
        format: 'md',
        fields: [
          {
            type: 'string',
            label: 'Title',
            name: 'title',
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
            type: 'image',
            list: true,
            name: 'images',
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
