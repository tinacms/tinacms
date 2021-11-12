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
import { tinaSchema } from './.tina/schema'
import { FilesystemStore } from '../..'
const rootPath = path.join(__dirname, '/')
const store = new FilesystemStore({ rootPath })
const consoleErrMock = jest.spyOn(console, 'error').mockImplementation()

const fixtures: Fixture[] = [
  {
    name: 'getAuthorDocument',
    assert: 'output',
  },
  {
    name: 'getPostDocument',
    assert: 'output',
  },
]

describe('A schema with templates in collections and no indexing', () => {
  fixtures.forEach((fixture) => {
    it(print(fixture), async () => {
      const { response, expectedResponsePath } = await setupFixture2(
        rootPath,
        tinaSchema,
        store,
        fixture,
        'forestry'
      )

      if (fixture.expectError) {
        expect(consoleErrMock).toHaveBeenCalled()
      }

      expect(response).toMatchFile(expectedResponsePath)
    })
  })
})
