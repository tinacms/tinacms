import { defineSchema, defineConfig } from 'tinacms'

const schema = defineSchema({
  collections: [
    {
      label: 'Post',
      name: 'post',
      path: 'content/posts',
      format: 'mdx',
      fields: [
        {
          name: 'title',
          type: 'string',
        },
        {
          name: 'author',
          type: 'reference',
          collections: ['author'],
        },
        {
          name: 'tags',
          type: 'string',
          list: true,
        },
        {
          name: 'categories',
          type: 'string',
          list: true,
          options: [
            { value: 'movies', label: 'Movies' },
            { value: 'music', label: 'Music' },
            { value: 'food', label: 'Foog' },
            { value: 'art', label: 'Art' },
          ],
        },
        {
          name: 'published',
          type: 'datetime',
        },
        {
          name: 'featured',
          type: 'boolean',
        },
        {
          name: 'body',
          type: 'rich-text',
          isBody: true,
        },
      ],
    },
    {
      label: 'Author',
      name: 'author',
      format: 'mdx',
      path: 'content/authors',
      fields: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'social',
          type: 'object',
          list: true,
          fields: [
            {
              type: 'string',
              name: 'platform',
              options: ['twitter', 'facebook', 'instagram'],
            },
            {
              type: 'string',
              name: 'handle',
            },
          ],
        },
        {
          name: 'bio',
          type: 'rich-text',
          isBody: true,
        },
      ],
    },
    {
      label: 'Block Page',
      name: 'blockPage',
      format: 'mdx',
      path: 'content/block-pages',
      fields: [
        {
          label: 'Title',
          name: 'title',
          type: 'string',
        },
        {
          label: 'Blocks',
          name: 'blocks',
          type: 'object',
          list: true,
          templates: [
            {
              name: 'hero',
              label: 'Hero',
              ui: {
                defaultItem: {
                  title: 'some title',
                },
              },
              fields: [
                {
                  label: 'Title',
                  name: 'title',
                  type: 'string',
                },
                {
                  label: 'Description',
                  name: 'description',
                  type: 'string',
                },
              ],
            },
            {
              name: 'blockQuote',
              label: 'Block Quote',
              fields: [
                {
                  name: 'message',
                  type: 'rich-text',
                },
                {
                  name: 'author',
                  type: 'reference',
                  collections: ['author'],
                },
              ],
            },
            {
              name: 'featuredPosts',
              label: 'Featured Posts',
              ui: {
                defaultItem: {
                  header: 'Featured Posts',
                },
              },
              fields: [
                {
                  name: 'header',
                  type: 'string',
                },
                {
                  name: 'blogs',
                  list: true,
                  type: 'object',
                  fields: [
                    {
                      name: 'item',
                      type: 'reference',
                      collections: ['post'],
                    },
                  ],
                },
              ],
            },
            {
              name: 'featureList',
              label: 'Feature List',
              fields: [
                {
                  label: 'Title',
                  name: 'title',
                  type: 'string',
                },
                {
                  label: 'Features',
                  name: 'items',
                  type: 'object',
                  list: true,
                  fields: [
                    {
                      label: 'Title',
                      name: 'title',
                      type: 'string',
                      ui: {
                        defaultValue: 'Okok',
                      },
                    },
                    {
                      label: 'description',
                      name: 'description',
                      type: 'string',
                    },
                  ],
                },
              ],
            },
            {
              name: 'slideshow',
              label: 'Slideshow',
              fields: [
                {
                  label: 'Title',
                  name: 'title',
                  type: 'string',
                },
                {
                  label: 'Items',
                  name: 'items',
                  type: 'object',
                  list: true,
                  fields: [
                    {
                      label: 'Title',
                      name: 'title',
                      type: 'string',
                    },
                    {
                      label: 'URL',
                      name: 'url',
                      type: 'string',
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
})

const branch = 'main'
// When working locally, hit our local filesystem.
// On a Vercel deployment, hit the Tina Cloud API
const apiURL =
  process.env.NODE_ENV == 'development'
    ? 'http://localhost:4001/graphql'
    : `https://content.tinajs.io/content/${process.env.NEXT_PUBLIC_TINA_CLIENT_ID}/github/${branch}`

export const tinaConfig = defineConfig({
  apiURL,
  schema,
  cmsCallback: (cms) => {
    cms.flags.set('tina-admin', true)
    return cms
  },
})

export default schema
