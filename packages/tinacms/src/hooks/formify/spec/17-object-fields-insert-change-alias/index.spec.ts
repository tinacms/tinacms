/**

*/

const query = `#graphql
query {
  author (relativePath: "author1.mdx") {
    soc: social {
      hand: handle
    }
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: [{}],
    mutationType: {
      type: 'insert',
      at: 0,
    },
    formId: 'content/authors/author1.mdx',
    field: {
      data: {
        tinaField: {
          name: 'social',
          type: 'object',
          list: true,
          fields: [
            {
              component: 'select',
              type: 'string',
              name: 'platform',
              options: [
                {
                  label: 'Choose an option',
                  value: '',
                },
                'twitter',
                'facebook',
                'instagram',
              ],
              parentTypename: 'AuthorSocial',
            },
            {
              component: 'text',
              type: 'string',
              name: 'handle',
              parentTypename: 'AuthorSocial',
            },
          ],
          parentTypename: 'Author',
          component: 'group-list',
        },
      },
      name: 'social',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: 'A',
    mutationType: {
      type: 'change',
    },
    formId: 'content/authors/author1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'text',
          type: 'string',
          name: 'social.0.handle',
          parentTypename: 'AuthorSocial',
        },
      },
      name: 'social.0.handle',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
