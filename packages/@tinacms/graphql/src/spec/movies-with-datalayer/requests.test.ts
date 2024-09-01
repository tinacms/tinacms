/**

*/

import path from 'path'
import { setupFixture, setupFixture2, print, Fixture } from '../setup'
import {
  describe,
  beforeEach,
  expect,
  afterEach,
  it,
  vi,
  SpyInstance,
} from 'vitest'
import { tinaSchema } from './.tina/schema'
import { MemoryLevel } from 'memory-level'
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

let consoleErrMock: SpyInstance
beforeEach(() => {
  consoleErrMock = vi
    .spyOn(console, 'error')
    .mockImplementation((message) => {})
})

afterEach(() => {
  consoleErrMock.mockRestore()
})

describe('A schema with indexing', () => {
  let level
  beforeEach(() => {
    level = new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    })
  })
  fixtures.forEach((fixture) => {
    it(print(fixture), async () => {
      const { responses, expectedResponsePaths } = await setupFixture(
        rootPath,
        tinaSchema,
        level,
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
        level,
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
