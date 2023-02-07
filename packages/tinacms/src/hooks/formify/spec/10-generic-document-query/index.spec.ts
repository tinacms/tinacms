/**

*/

const query = `#graphql
query GetBlockPageDocument {
  document(collection: "author", relativePath: "author1.mdx") {
    ...on Author {
      name
    }
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: 'Author One!',
    previousValue: 'Author One',
    mutationType: {
      type: 'change',
    },
    formId: 'content/authors/author1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'text',
          name: 'name',
          type: 'string',
          parentTypename: 'Author',
        },
      },
      name: 'name',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
