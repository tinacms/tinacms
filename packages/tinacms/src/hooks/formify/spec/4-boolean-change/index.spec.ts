/**

*/

const query = `#graphql
query GetBlockPageDocument {
  post(relativePath: "post1.mdx") {
    featured
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: true,
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'toggle',
          name: 'featured',
          type: 'boolean',
          parentTypename: 'Post',
        },
      },
      name: 'featured',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: false,
    previousValue: true,
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'toggle',
          name: 'featured',
          type: 'boolean',
          parentTypename: 'Post',
        },
      },
      name: 'featured',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
