/**

*/

const query = `#graphql
query GetBlockPageDocument {
  blockPage(relativePath: "blockPage1.mdx") {
    title
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: 'Block Page 1!',
    previousValue: 'Block Page 1',
    mutationType: {
      type: 'change',
    },
    formId: 'content/block-pages/blockPage1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'text',
          label: 'Title',
          name: 'title',
          type: 'string',
          parentTypename: 'BlockPage',
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
