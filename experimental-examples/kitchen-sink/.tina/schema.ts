import { defineSchema } from '@tinacms/cli'

export default defineSchema({
  collections: [
    {
      label: 'Page Content',
      name: 'page',
      path: 'content/page',
      fields: [
        {
          name: 'body',
          label: 'Main Content',
          type: 'rich-text',
          isBody: true,
          templates: [
            {
              name: 'component1',
              label: 'Component Test',
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
            {
              name: 'somethingelsenew',
              label: 'I adding else something new!!!!',
              fields: [
                { label: 'Prop 1', name: 'prop1', type: 'string' },
                { label: 'Prop 2', name: 'prop2', type: 'string' },
              ],
            },
          ],
        },
        {
          name: 'subtitle',
          label: 'subtitle',
          type: 'string',
        },
      ],
    },
    {
      label: 'Blog Posts',
      name: 'post',
      path: 'content/post',
      fields: [
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'string',
          label: 'Blog Post Body',
          name: 'body',
          isBody: true,
          ui: {
            component: 'textarea',
          },
        },
      ],
    },
  ],
})
