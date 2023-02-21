/**

*/

const query = `#graphql
query MyQuery {
  post(relativePath: "post1.mdx") {
    title
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: 'Post 1!',
    previousValue: 'Post 1',
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'text',
          name: 'title',
          type: 'string',
          parentTypename: 'Post',
        },
      },
      name: 'title',
    },
  },
  {
    type: 'forms:reset',
    value: null,
    mutationType: {
      type: 'reset',
    },
    formId: 'content/posts/post1.mdx',
    field: {},
  },
  {
    type: 'forms:fields:onChange',
    value: 'Post 1!',
    previousValue: 'Post 1',
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'text',
          name: 'title',
          type: 'string',
          parentTypename: 'Post',
        },
      },
      name: 'title',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
