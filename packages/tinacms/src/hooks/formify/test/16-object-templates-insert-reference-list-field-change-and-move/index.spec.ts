/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const query = `#graphql
query {
  getBlockPageDocument(relativePath: "blockPage1.mdx") {
    data {
      blocks {
        ...on BlockPageBlocksFeaturedPosts {
          blogs {
            item {
              ...on PostDocument {
                data {
                  title
                }
              }
            }
          }
        }
      }
    }
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: [
      {
        header: 'Featured Posts',
        _template: 'featuredPosts',
      },
    ],
    mutationType: {
      type: 'insert',
      at: 0,
    },
    formId: 'content/block-pages/blockPage1.mdx',
    field: {
      data: {
        tinaField: {
          label: 'Blocks',
          name: 'blocks',
          type: 'object',
          list: true,
          templates: {
            hero: {
              label: 'Hero',
              key: 'hero',
              fields: [
                {
                  component: 'text',
                  label: 'Title',
                  name: 'title',
                  type: 'string',
                },
                {
                  component: 'text',
                  label: 'Description',
                  name: 'description',
                  type: 'string',
                },
              ],
              defaultItem: {
                title: 'some title',
              },
            },
            blockQuote: {
              label: 'Block Quote',
              key: 'blockQuote',
              fields: [
                {
                  name: 'message',
                  type: 'rich-text',
                  templates: [],
                  component: 'rich-text',
                },
                {
                  name: 'author',
                  type: 'reference',
                  collections: ['author'],
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
              ],
            },
            featuredPosts: {
              label: 'Featured Posts',
              key: 'featuredPosts',
              fields: [
                {
                  component: 'text',
                  name: 'header',
                  type: 'string',
                },
                {
                  name: 'blogs',
                  list: true,
                  type: 'object',
                  fields: [
                    {
                      name: 'item',
                      type: 'reference',
                      collections: ['post'],
                      component: 'reference',
                      options: [
                        {
                          label: 'Choose an option',
                          value: '',
                        },
                        {
                          value: 'content/posts/post1.mdx',
                          label: 'content/posts/post1.mdx',
                        },
                      ],
                    },
                  ],
                  component: 'group-list',
                },
              ],
              defaultItem: {
                header: 'Featured Posts',
                _template: 'featuredPosts',
              },
            },
          },
          typeMap: {
            hero: 'BlockPageBlocksHero',
            blockQuote: 'BlockPageBlocksBlockQuote',
            featuredPosts: 'BlockPageBlocksFeaturedPosts',
          },
          component: 'blocks',
        },
      },
      name: 'blocks',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: [{}],
    mutationType: {
      type: 'insert',
      at: 0,
    },
    formId: 'content/block-pages/blockPage1.mdx',
    field: {
      data: {
        tinaField: {
          name: 'blocks.0.blogs',
          list: true,
          type: 'object',
          fields: [
            {
              name: 'item',
              type: 'reference',
              collections: ['post'],
              component: 'reference',
              options: [
                {
                  label: 'Choose an option',
                  value: '',
                },
                {
                  value: 'content/posts/post1.mdx',
                  label: 'content/posts/post1.mdx',
                },
              ],
            },
          ],
          component: 'group-list',
        },
      },
      name: 'blocks.0.blogs',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: 'content/posts/post1.mdx',
    mutationType: {
      type: 'change',
    },
    formId: 'content/block-pages/blockPage1.mdx',
    field: {
      data: {
        tinaField: {
          name: 'blocks.0.blogs.0.item',
          type: 'reference',
          collections: ['post'],
          component: 'reference',
          options: [
            {
              label: 'Choose an option',
              value: '',
            },
            {
              value: 'content/posts/post1.mdx',
              label: 'content/posts/post1.mdx',
            },
          ],
        },
      },
      name: 'blocks.0.blogs.0.item',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: [
      {},
      {
        item: 'content/posts/post1.mdx',
      },
    ],
    previousValue: [
      {
        item: 'content/posts/post1.mdx',
      },
    ],
    mutationType: {
      type: 'insert',
      at: 0,
    },
    formId: 'content/block-pages/blockPage1.mdx',
    field: {
      data: {
        tinaField: {
          name: 'blocks.0.blogs',
          list: true,
          type: 'object',
          fields: [
            {
              name: 'item',
              type: 'reference',
              collections: ['post'],
              component: 'reference',
              options: [
                {
                  label: 'Choose an option',
                  value: '',
                },
                {
                  value: 'content/posts/post1.mdx',
                  label: 'content/posts/post1.mdx',
                },
              ],
            },
          ],
          component: 'group-list',
        },
      },
      name: 'blocks.0.blogs',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: [
      {
        item: 'content/posts/post1.mdx',
      },
      {},
    ],
    previousValue: [
      {},
      {
        item: 'content/posts/post1.mdx',
      },
    ],
    mutationType: {
      type: 'move',
      from: 1,
      to: 0,
    },
    formId: 'content/block-pages/blockPage1.mdx',
    field: {
      data: {
        tinaField: {
          name: 'blocks.0.blogs',
          list: true,
          type: 'object',
          fields: [
            {
              name: 'item',
              type: 'reference',
              collections: ['post'],
              component: 'reference',
              options: [
                {
                  label: 'Choose an option',
                  value: '',
                },
                {
                  value: 'content/posts/post1.mdx',
                  label: 'content/posts/post1.mdx',
                },
              ],
            },
          ],
          component: 'group-list',
        },
      },
      name: 'blocks.0.blogs',
    },
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
        },
      },
      name: 'title',
    },
  },
]

import { testRunner } from '../runner'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
