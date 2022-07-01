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
import { LevelStore } from '@tinacms/datalayer'
import { tinaSchema } from './.tina/schema'
const rootPath = path.join(__dirname, '/')

const fixtures: Fixture[] = [
  {
    name: 'getMovieList',
    description: 'Filtering on movies collection',
    assert: 'output',
  },
  {
    name: 'getMovieList2',
    description: "Querying a list with 'startsWith'",
    assert: 'output',
  },
  {
    name: 'getCrewList',
    description: 'Querying a collection with templates works',
    assert: 'output',
  },
  {
    name: 'getDirectorList',
    assert: 'output',
  },
]

const mutationFixtures: Fixture[] = [
  {
    name: 'addPendingDocument',
    description: 'Adding a document',
    assert: 'output',
  },
  {
    name: 'addPendingDocumentExisting',
    description: 'Adding a document when one already exists',
    assert: 'output',
    expectError: true,
  },
  {
    name: 'updateMovieDocument',
    description: 'Updating an existing document',
    assert: 'file',
    filename: 'content/movies/star-wars.md',
  },
  {
    name: 'updateMovieDocumentNonExisting',
    description: 'Updating an existing document',
    assert: 'output',
    expectError: true,
  },
]

let consoleErrMock
beforeEach(() => {
  consoleErrMock = jest
    .spyOn(console, 'error')
    .mockImplementation((message) => {})
})

afterEach(() => {
  consoleErrMock.mockRestore()
})

describe('A schema with indexing', () => {
  let store
  beforeEach(() => {
    store = new LevelStore(rootPath, true)
  })
  fixtures.forEach((fixture) => {
    it(print(fixture), async () => {
      const { responses, expectedResponsePaths } = await setupFixture(
        rootPath,
        tinaSchema,
        store,
        fixture,
        'movies-with-datalayer'
      )

      if (fixture.expectError) {
        expect(consoleErrMock).toHaveBeenCalled()
      } else {
        expect(consoleErrMock).not.toHaveBeenCalled()
      }

      // await store.print()
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
        'movies-with-datalayer',
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
