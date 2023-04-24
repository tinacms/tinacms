import { defineSchema } from 'tinacms'

export default defineSchema({
  collections: [
    {
      label: 'Page Content',
      name: 'page',
      path: 'content/page',
      format: 'mdx',
      fields: [
        {
          name: 'heading',
          label: 'Heading',
          type: 'string',
        },
        {
          name: 'subtitle',
          label: 'Subtitle',
          type: 'string',
          ui: {
            component: 'textarea',
          },
        },
        {
          name: 'body',
          label: 'Main Content',
          type: 'rich-text',
          isBody: true,
          templates: [
            {
              name: 'component1',
              label: 'Component Asdf',
              fields: [
                { label: 'Prop 1', name: 'prop1', type: 'string' },
                { label: 'Prop 2', name: 'prop2', type: 'string' },
              ],
            },
            {
              name: 'component2',
              label: 'I adding something new!!!!',
              fields: [
                { label: 'Prop 1', name: 'prop1', type: 'string' },
                { label: 'Prop 2', name: 'prop2', type: 'string' },
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
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
          required: true,
        },
        {
          type: 'string',
          label: 'Excerpt',
          name: 'excerpt',
          required: false,
        },
        {
          type: 'rich-text',
          label: 'Blog Post Body',
          name: 'body',
          isBody: true,
        },
      ],
    },
  ],
})
