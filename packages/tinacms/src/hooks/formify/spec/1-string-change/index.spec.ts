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
  getBlockPageDocument(relativePath: "blockPage1.mdx") {
    data {
      title
    }
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
test('formifies the query and responds correctly to events', async () => {
  await testRunner(query, events, __dirname)
})
