/**

*/

const query = `#graphql
query {
  post(relativePath: "post1.mdx") {
    author {
      ...on Document {
        _sys {
          filename
        }
      }
    }
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: 'content/authors/author1.mdx',
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          name: 'author',
          type: 'reference',
          collections: ['author'],
          parentTypename: 'Post',
          component: 'reference',
        },
      },
      name: 'author',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname, true)
})
