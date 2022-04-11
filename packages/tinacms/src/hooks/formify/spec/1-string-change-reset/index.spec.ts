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
query MyQuery {
  post(relativePath: "post1.mdx") {
    title
  }
}
`

const events = [
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
          parentTypename: 'Post',
        },
      },
      name: 'title',
    },
  },
  {
    type: 'forms:reset',
    value: null,
    mutationType: {
      type: 'reset',
    },
    formId: 'content/posts/post1.mdx',
    field: {},
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
          parentTypename: 'Post',
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
