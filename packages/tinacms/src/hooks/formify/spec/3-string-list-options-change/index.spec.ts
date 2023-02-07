/**

*/

const query = `#graphql
query GetBlockPageDocument {
  post(relativePath: "post1.mdx") {
    categories
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: ['movies'],
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'checkbox-group',
          name: 'categories',
          type: 'string',
          list: true,
          options: [
            {
              value: 'movies',
              label: 'Movies',
            },
            {
              value: 'music',
              label: 'Music',
            },
            {
              value: 'food',
              label: 'Foog',
            },
            {
              value: 'art',
              label: 'Art',
            },
          ],
          parentTypename: 'Post',
        },
      },
      name: 'categories',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: ['movies', 'music'],
    previousValue: ['movies'],
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'checkbox-group',
          name: 'categories',
          type: 'string',
          list: true,
          options: [
            {
              value: 'movies',
              label: 'Movies',
            },
            {
              value: 'music',
              label: 'Music',
            },
            {
              value: 'food',
              label: 'Foog',
            },
            {
              value: 'art',
              label: 'Art',
            },
          ],
          parentTypename: 'Post',
        },
      },
      name: 'categories',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: ['movies', 'music', 'art'],
    previousValue: ['movies', 'music'],
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'checkbox-group',
          name: 'categories',
          type: 'string',
          list: true,
          options: [
            {
              value: 'movies',
              label: 'Movies',
            },
            {
              value: 'music',
              label: 'Music',
            },
            {
              value: 'food',
              label: 'Foog',
            },
            {
              value: 'art',
              label: 'Art',
            },
          ],
          parentTypename: 'Post',
        },
      },
      name: 'categories',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: ['movies', 'art'],
    previousValue: ['movies', 'music', 'art'],
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'checkbox-group',
          name: 'categories',
          type: 'string',
          list: true,
          options: [
            {
              value: 'movies',
              label: 'Movies',
            },
            {
              value: 'music',
              label: 'Music',
            },
            {
              value: 'food',
              label: 'Foog',
            },
            {
              value: 'art',
              label: 'Art',
            },
          ],
          parentTypename: 'Post',
        },
      },
      name: 'categories',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
