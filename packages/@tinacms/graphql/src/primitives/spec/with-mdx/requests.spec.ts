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

import path from 'path'
import { setup, setupFixture, setupFixture2 } from '../setup'
import { toMatchFile } from 'jest-file-snapshot'

const rootPath = path.join(__dirname, '/')

const fixtures = [
  // 'getAuthorDocument',
  'getPostDocument',
  'getPostDocumentAdvanced',
  // 'updateDocument',
  // 'updateDocument-no-collection',
]
const fixtures2 = [
  // {
  //   name: 'getPostDocumentAdvanced',
  //   assert: 'output',
  // },
  {
    name: 'updatePostDocumentAdvanced',
    assert: 'file',
    filename: 'content/posts/hello-world-advanced.md',
  },
]
import { tinaSchema } from './.tina/schema'

expect.extend({ toMatchFile })

describe('The given configuration', () => {
  fixtures2.forEach((fixture) => {
    it(`${fixture.name} works`, async () => {
      const { response, expectedResponsePath } = await setupFixture2(
        rootPath,
        tinaSchema,
        fixture
      )

      // Add \n because prettier format adds it if a user edits the file manually
      expect(response).toMatchFile(expectedResponsePath)
    })
  })
})
