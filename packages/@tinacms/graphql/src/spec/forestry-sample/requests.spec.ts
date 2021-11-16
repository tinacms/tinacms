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
import { setupFixture, setupFixture2, print, Fixture } from '../setup'
import { tinaSchema } from './.tina/schema'
import { MemoryStore } from '../../database/store/memory'
const rootPath = path.join(__dirname, '/')

class FilesystemStoreTest extends MemoryStore {
  public supportsSeeding() {
    return false
  }
  public supportsIndexing() {
    // Technically this is not an indexable store, but we need
    // to get the data in here during the setup. May need a separate
    // concept to indicate that this store shouldn't hold index info
    // but does need data from the "bridge" to get started.
    return true
  }
}

const store = new FilesystemStoreTest(rootPath)

const fixtures: Fixture[] = [
  {
    name: 'getAuthorDocument',
    assert: 'output',
  },
  {
    name: 'getPageDocument',
    assert: 'output',
  },
  {
    name: 'getPostDocument',
    assert: 'output',
  },
]
const mutationFixtures: Fixture[] = [
  {
    name: 'addPendingDocument',
    description: 'Adding a document',
    assert: 'file',
    filename: 'content/posts/my-post.md',
  },
  {
    name: 'addPendingDocumentWithoutTemplate',
    description: 'Adding a document without the template param',
    assert: 'output',
    expectError: true,
  },
]

beforeEach(async () => {
  await store.clear()
})

let consoleErrMock
beforeEach(() => {
  consoleErrMock = jest.spyOn(console, 'error').mockImplementation()
})
afterEach(() => {
  consoleErrMock.mockRestore()
})

describe('A schema with templates in collections and no indexing', () => {
  fixtures.forEach((fixture) => {
    it(print(fixture), async () => {
      const { responses, expectedResponsePaths } = await setupFixture(
        rootPath,
        tinaSchema,
        store,
        fixture,
        'forestry'
      )

      if (fixture.expectError) {
        expect(consoleErrMock).toHaveBeenCalled()
      } else {
        expect(consoleErrMock).not.toHaveBeenCalled()
      }

      responses.forEach((expResponse, index) => {
        const expectedResponsePath2 = expectedResponsePaths[index]
        expect(expResponse).toMatchFile(expectedResponsePath2)
      })
    })
  })

  mutationFixtures.forEach((fixture) => {
    it(print(fixture), async () => {
      const { responses, expectedResponsePaths } = await setupFixture2(
        rootPath,
        tinaSchema,
        store,
        fixture,
        'forestry',
        '_mutation',
        'mutations'
      )

      if (fixture.expectError) {
        expect(consoleErrMock).toHaveBeenCalled()
      } else {
        expect(consoleErrMock).not.toHaveBeenCalled()
      }

      responses.forEach((expResponse, index) => {
        const expectedResponsePath2 = expectedResponsePaths[index]
        expect(expResponse).toMatchFile(expectedResponsePath2)
      })
    })
  })
})
