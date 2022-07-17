import { defineSchema, defineConfig } from 'tinacms'
import { client } from './client'

const schema = defineSchema({
  config: {
    media: {
      // If you wanted cloudinary do this
      // loadCustomStore: async () => {
      //   const pack = await import("next-tinacms-cloudinary");
      //   return pack.TinaCloudCloudinaryMediaStore;
      // },
      // this is the config for the tina cloud media store
      tina: {
        publicFolder: 'public',
        mediaRoot: 'uploads',
      },
    },
  },
  collections: [
    {
      label: 'Blog Posts',
      name: 'posts',
      path: 'content/posts',
      format: 'mdx',
      fields: [
        {
          type: 'rich-text',
          label: 'Body',
          name: 'body',
          templates: [
            {
              name: 'MyShortcode',
              label: 'My Shortcode',
              inline: true,
              match: {
                start: '{{<',
                end: '>}}',
              },
              fields: [
                {
                  name: 'text',
                  label: 'Text',
                  type: 'string',
                  required: true,
                  isTitle: true,
                  ui: {
                    component: 'textarea',
                  },
                },
              ],
            },
            {
              name: 'MyShortcode2',
              label: 'My Shortcode 2',
              inline: true,
              match: {
                start: '{{%',
                end: '%}}',
              },
              fields: [
                {
                  name: 'text',
                  required: true,
                  isTitle: true,
                  label: 'Text',
                  type: 'string',
                  ui: {
                    component: 'textarea',
                  },
                },
              ],
            },
            {
              name: 'RelatedPost',
              label: 'Related Post',
              inline: true,
              fields: [
                {
                  name: 'post',
                  label: 'Post',
                  type: 'reference',
                  collections: ['posts'],
                },
              ],
            },
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
              name: 'BlockQuote',
              label: 'Block Quote',
              fields: [
                {
                  name: 'children',
                  label: 'Quote',
                  type: 'rich-text',
                  templates: [
                    {
                      name: 'BlockQuote',
                      label: 'Block Quote',
                      fields: [
                        {
                          name: 'children',
                          label: 'Quote',
                          type: 'rich-text',
                        },
                        {
                          name: 'authorName',
                          isTitle: true,
                          required: true,
                          label: 'Author',
                          type: 'string',
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'authorName',
                  isTitle: true,
                  required: true,
                  label: 'Author',
                  type: 'string',
                },
              ],
            },
            {
              name: 'NewsletterSignup',
              label: 'Newsletter Sign Up',
              fields: [
                {
                  name: 'children',
                  label: 'CTA',
                  type: 'rich-text',
                },
                {
                  name: 'placeholder',
                  label: 'Placeholder',
                  type: 'string',
                },
                {
                  name: 'buttonText',
                  label: 'Button Text',
                  type: 'string',
                },
                {
                  name: 'disclaimer',
                  label: 'Disclaimer',
                  type: 'rich-text',
                },
              ],
              ui: {
                defaultItem: {
                  placeholder: 'Enter your email',
                  buttonText: 'Notify Me',
                },
              },
            },
          ],
          isBody: true,
        },
      ],
    },
  ],
})

export default schema

export const tinaConfig = defineConfig({
  client,
  schema,
})
