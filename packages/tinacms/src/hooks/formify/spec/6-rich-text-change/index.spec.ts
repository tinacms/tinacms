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
