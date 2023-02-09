/**

*/

const query = `#graphql
query GetBlockPageDocument {
  post(relativePath: "post1.mdx") {
    body
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: {
      type: 'root',
      children: [
        {
          type: 'p',
          children: [
            {
              type: 'text',
              text: 'This is a test!',
            },
          ],
        },
      ],
    },
    previousValue: {
      type: 'root',
      children: [
        {
          type: 'p',
          children: [
            {
              type: 'text',
              text: 'This is a test',
            },
          ],
        },
      ],
    },
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          name: 'body',
          type: 'rich-text',
          isBody: true,
          parentTypename: 'Post',
          templates: [],
          component: 'rich-text',
        },
      },
      name: 'body',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
