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
const rootPath = path.join(__dirname, '/')
import { LevelStore } from '@tinacms/datalayer'

class FilesystemStoreTest extends LevelStore {
  constructor(rootPath: string, useMemory: boolean = false) {
    super(rootPath, useMemory)
  }
  public supportsSeeding() {
    return true
  }
  public supportsIndexing() {
    return false
  }
}

const store = new FilesystemStoreTest(rootPath, true)

const fixtures: Fixture[] = [
  {
    name: 'getMovieDocument',
    assert: 'output',
  },
  {
    name: 'getDocument',
    assert: 'output',
  },
  {
    name: 'getDirectorList',
    assert: 'output',
  },
  {
    name: 'getMovieList',
    description: 'Trying to filter',
    assert: 'output',
    expectError: true,
  },
  {
    name: 'getDirectorDocument',
    assert: 'output',
  },
  {
    name: 'getCollections',
    assert: 'output',
  },
  {
    name: 'getCollection',
    assert: 'output',
  },
]

const mutationFixtures: Fixture[] = [
  {
    name: 'updateDocument',
    description: 'Updating a document works',
    assert: 'file',
    filename: 'content/movies/star-wars.md',
  },
]

let consoleErrMock
beforeEach(() => {
  consoleErrMock = jest.spyOn(console, 'error').mockImplementation()
})
afterEach(() => {
  consoleErrMock.mockRestore()
})

describe('A schema without indexing', () => {
  fixtures.forEach((fixture) => {
    it(print(fixture), async () => {
      const { responses, expectedResponsePaths } = await setupFixture(
        rootPath,
        tinaSchema,
        store,
        fixture,
        'movies'
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
        'movies',
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
