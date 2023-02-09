/**

*/

const query = `#graphql
query GetBlockPageDocument {
  post(relativePath: "post1.mdx") {
    published
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: '2022-03-03T08:00:00.000Z',
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'date',
          name: 'published',
          type: 'datetime',
          parentTypename: 'Post',
        },
      },
      name: 'published',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: '2022-03-14T07:00:00.000Z',
    previousValue: '2022-03-03T08:00:00.000Z',
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'date',
          name: 'published',
          type: 'datetime',
          parentTypename: 'Post',
        },
      },
      name: 'published',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
