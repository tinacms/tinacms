import { defineConfig } from 'tinacms';
import PathwaySchema, { contentBlock } from './collection/bugReproduction';

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'public',
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: 'page',
        path: 'content/page',
        label: 'Page',
        format: 'mdx',
        frontmatterFormat: 'toml',
        frontmatterDelimiters: ['+++', '+++'],
        ui: {
          filename: {
            description:
              'The name of the <span style="text-decoration:underline;font-weight:bold">file</span>',
            showFirst: true,
          },
          // router: ({ document }) => {
          //   if (document._sys.breadcrumbs[0] === 'home') {
          //     return '/';
          //   }
          //   return `/${document._sys.filename}`;
          // },
          // Example of beforeSubmit
          beforeSubmit: async ({ values, cms, form, tinaForm }) => {
            return {
              ...values,
              lastUpdated: new Date().toISOString(),
            };
          },
        },
        fields: [
          {
            label: 'Title',
            name: 'Title',
            type: 'string',
            ui: {
              description:
                'The title of the <span style="text-decoration:underline;font-weight:bold">page</span>',
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
                name: 'apiReference',
                label: 'API Reference',
                fields: [
                  {
                    type: 'string',
                    name: 'title',
                    label: 'Title',
                  },
                  {
                    type: 'object',
                    name: 'property',
                    label: 'Property',
                    list: true,
                    ui: {
                      itemProps: (item) => {
                        return {
                          label: item.groupName
                            ? `📂 ${item.groupName} | ${item.name}`
                            : item.name,
                        };
                      },
                    },
                    fields: [
                      {
                        type: 'string',
                        name: 'groupName',
                        label: 'Group Name',
                        description:
                          'Adjacent properties with the same group name will be grouped together',
                      },
                      {
                        type: 'string',
                        name: 'name',
                        label: 'Name',
                      },
                      {
                        type: 'rich-text',
                        name: 'description',
                        label: 'Description',
                      },
                      {
                        type: 'string',
                        name: 'type',
                        label: 'Type',
                      },
                      {
                        type: 'string',
                        name: 'default',
                        label: 'Default',
                      },
                      {
                        type: 'boolean',
                        name: 'required',
                        label: 'Required',
                      },
                      {
                        type: 'boolean',
                        name: 'experimental',
                        label: 'Experimental',
                      },
                    ],
                  },
                ],
              },
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
      contentBlock,
      PathwaySchema,
      {
        name: 'slateJson',
        path: 'content/slate-json',
        format: 'json',
        fields: [
          {
            name: 'title',
            type: 'string',
            label: 'Title',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            parser: { type: 'slatejson' },
            templates: [
              {
                name: 'DateTime',
                label: 'Date & Time',
                inline: true,
                fields: [
                  {
                    name: 'format',
                    label: 'Format',
                    type: 'string',
                    options: ['utc', 'iso', 'local'],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'simpleRef',
        path: 'content/refs',
        fields: [
          {
            name: 'title',
            type: 'string',
          },
        ],
      },
      {
        name: 'post',
        label: 'Posts',
        format: 'mdx',
        path: 'content/posts',
        ui: {
          router({ document }) {
            return `/posts/${document._sys.filename}`;
          },
        },
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
          {
            name: 'items',
            type: 'object',
            ui: {
              itemProps: (values) => ({
                label: values?.title || 'Showcase Item',
              }),
            },
            list: true,
            fields: [
              {
                name: 'title',
                type: 'string',
                required: true,
                isTitle: true,
              },
              {
                name: 'description',
                type: 'rich-text',
              },
              {
                name: 'image',
                type: 'image',
              },

              {
                name: 'ref',
                type: 'reference',
                collections: ['simpleRef'],
              },
            ],
          },
          {
            type: 'rich-text',
            label: 'Test Templates',
            name: 'template',
            isBody: true,
            toolbarOverride: [
              'heading',
              'bold',
              'italic',
              'image',
              'link',
              'embed',
            ],
            overrides: {
              toolbar: ['heading', 'bold', 'italic', 'image', 'link', 'embed'],
              showFloatingToolbar: false,
            },
            templates: [
              {
                name: 'DateTime',
                label: 'Date & Time',
                inline: true,
                fields: [
                  {
                    name: 'format',
                    label: 'Format',
                    type: 'string',
                    options: ['utc', 'iso', 'local'],
                  },
                ],
              },
              {
                name: 'ref',
                fields: [
                  {
                    name: 'ref',
                    type: 'reference',
                    collections: ['simpleRef'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
