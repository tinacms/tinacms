import { defineStaticConfig } from 'tinacms'

const slugify = (values) => {
  return `${(values?.name || values?.title || `document-${Date.now()}`)
    .toLowerCase()
    .split(' ')
    .join('-')}`
}
const router = ({ document, collection }) => {
  return `/${collection.name}/${document._sys.filename}`
}
export default defineStaticConfig({
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
  branch: null,
  clientId: null,
  token: null,
  schema: {
    collections: [
      {
        name: 'page',
        label: 'Page',
        path: 'content/pages',
        ui: {
          filename: {
            slugify: slugify,
            readonly: true,
          },
          router,
        },
        templates: [
          {
            label: 'Showcase',
            name: 'showcase',
            fields: [
              {
                name: 'title',
                type: 'string',
                required: true,
                isTitle: true,
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
                ],
              },
            ],
          },
          {
            label: 'Block Page',
            name: 'blockPage',
            fields: [
              {
                name: 'title',
                type: 'string',
                required: true,
                isTitle: true,
              },
              {
                name: 'blocks',
                type: 'object',
                list: true,
                templates: [
                  {
                    label: 'Hero',
                    name: 'hero',
                    fields: [
                      { type: 'string', name: 'headline' },
                      { type: 'string', name: 'description' },
                      {
                        type: 'object',
                        name: 'actions',
                        list: true,
                        fields: [
                          {
                            type: 'string',
                            name: 'label',
                          },
                          {
                            type: 'string',
                            name: 'url',
                          },
                          {
                            type: 'string',
                            name: 'variant',
                            options: ['primary', 'secondary', 'simple'],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    label: 'Features',
                    name: 'features',
                    fields: [
                      { type: 'string', name: 'title' },
                      { type: 'string', name: 'items', list: true },
                    ],
                  },
                  {
                    label: 'CTA',
                    name: 'cta',
                    fields: [
                      { type: 'string', name: 'title' },
                      { type: 'string', name: 'description' },
                      {
                        type: 'object',
                        name: 'actions',
                        list: true,
                        fields: [
                          {
                            type: 'string',
                            name: 'label',
                          },
                          {
                            type: 'string',
                            name: 'url',
                          },
                          {
                            type: 'string',
                            name: 'variant',
                            options: ['primary', 'secondary', 'simple'],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'post',
        label: 'Post',
        path: 'content/post',
        ui: {
          router,
          filename: {
            slugify,
            readonly: true,
          },
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            required: true,
            isTitle: true,
          },
          {
            type: 'reference',
            name: 'author',
            collections: ['author'],
          },
          {
            type: 'string',
            list: true,
            name: 'categories',
            options: [
              { label: 'React', value: 'react' },
              { label: 'Next.js', value: 'nextjs' },
              { label: 'Content Management', value: 'cms' },
            ],
          },
          {
            type: 'rich-text',
            name: 'body',
            isBody: true,
          },
          {
            type: 'image',
            name: 'image',
          },
        ],
      },
      {
        name: 'author',
        label: 'Author',
        path: 'content/authors',
        ui: {
          filename: {
            slugify,
          },
        },
        fields: [
          {
            type: 'string',
            name: 'name',
          },
          {
            type: 'rich-text',
            name: 'bio',
          },
          {
            type: 'string',
            name: 'hobbies',
            list: true,
          },
          {
            type: 'image',
            name: 'image',
          },
        ],
      },
      {
        name: 'documentation',
        label: 'Documentation',
        path: 'content/documentation',
        ui: {
          router,
          filename: {
            slugify,
          },
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            required: true,
            isTitle: true,
          },
          {
            type: 'object',
            name: 'tags',
            list: true,
            fields: [
              {
                type: 'reference',
                name: 'reference',
                collections: ['tag'],
              },
            ],
          },
          {
            type: 'rich-text',
            name: 'body',
            isBody: true,
          },
        ],
      },
      {
        name: 'tag',
        label: 'Tag',
        path: 'content/tags',
        format: 'json',
        fields: [
          {
            type: 'string',
            name: 'title',
            required: true,
            isTitle: true,
          },
          {
            type: 'rich-text',
            name: 'description',
          },
        ],
      },
    ],
  },
})
