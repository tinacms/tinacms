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
query GetBlockPageDocument {
  post(relativePath: "post1.mdx") {
    tags
  }
}
`

const events = [
  {
    type: 'forms:fields:onChange',
    value: [''],
    mutationType: {
      type: 'insert',
      at: 0,
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'list',
          field: {
            component: 'text',
          },
          name: 'tags',
          type: 'string',
          list: true,
          parentTypename: 'Post',
        },
      },
      name: 'tags',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: '1',
    previousValue: '',
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          type: 'string',
          list: true,
          parentTypename: 'Post',
          component: 'text',
          label: 'Value',
          name: 'tags.0',
        },
      },
      name: 'tags.0',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: ['', '1'],
    previousValue: ['1'],
    mutationType: {
      type: 'insert',
      at: 0,
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'list',
          field: {
            component: 'text',
          },
          name: 'tags',
          type: 'string',
          list: true,
          parentTypename: 'Post',
        },
      },
      name: 'tags',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: '2',
    previousValue: '',
    mutationType: {
      type: 'change',
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          type: 'string',
          list: true,
          parentTypename: 'Post',
          component: 'text',
          label: 'Value',
          name: 'tags.0',
        },
      },
      name: 'tags.0',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: ['1', '2'],
    previousValue: ['2', '1'],
    mutationType: {
      type: 'move',
      from: 1,
      to: 0,
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'list',
          field: {
            component: 'text',
          },
          name: 'tags',
          type: 'string',
          list: true,
          parentTypename: 'Post',
        },
      },
      name: 'tags',
    },
  },
  {
    type: 'forms:fields:onChange',
    value: ['2'],
    previousValue: ['1', '2'],
    mutationType: {
      type: 'remove',
      at: 0,
    },
    formId: 'content/posts/post1.mdx',
    field: {
      data: {
        tinaField: {
          component: 'list',
          field: {
            component: 'text',
          },
          name: 'tags',
          type: 'string',
          list: true,
          parentTypename: 'Post',
        },
      },
      name: 'tags',
    },
  },
]

import { testRunner } from '../runner'
// @ts-ignore jest: Cannot find name 'test'
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
