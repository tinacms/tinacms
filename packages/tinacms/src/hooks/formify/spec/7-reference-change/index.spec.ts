/**

*/

const query = `#graphql
query GetBlockPageDocument {
  post(relativePath: "post1.mdx") {
    author {
      ...on Author {
        name
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
          options: [
            {
              label: 'Choose an option',
              value: '',
            },
            {
              value: 'content/authors/author1.mdx',
              label: 'content/authors/author1.mdx',
            },
          ],
        },
      },
      name: 'author',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: '',
    previousValue: 'content/authors/author1.mdx',
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
          options: [
            {
              label: 'Choose an option',
              value: '',
            },
            {
              value: 'content/authors/author1.mdx',
              label: 'content/authors/author1.mdx',
            },
          ],
        },
      },
      name: 'author',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
