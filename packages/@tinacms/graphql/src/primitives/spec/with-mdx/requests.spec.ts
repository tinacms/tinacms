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
import { setupFixture2, print, Fixture } from '../setup'
import { LevelStore } from '../../database/store/level'
import { tinaSchema } from './.tina/schema'
const rootPath = path.join(__dirname, '/')
const store = new LevelStore(rootPath)

const fixtures: Fixture[] = [
  {
    name: 'getPostDocumentAdvanced',
    assert: 'output',
  },
  {
    name: 'updatePostDocumentAdvanced',
    assert: 'file',
    filename: 'content/posts/hello-world-advanced.md',
  },
  {
    name: 'kitchenSink',
    assert: 'output',
  },
]

describe('A schema that uses MDX', () => {
  fixtures.forEach((fixture) => {
    it(print(fixture), async () => {
      const { response, expectedResponsePath } = await setupFixture2(
        rootPath,
        tinaSchema,
        store,
        fixture,
        'with-mdx'
      )

      expect(response).toMatchFile(expectedResponsePath)
    })
  })
})
