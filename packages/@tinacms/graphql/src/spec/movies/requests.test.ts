/**

*/

import path from 'path'
import { setupFixture, setupFixture2, print, Fixture } from '../setup'
import { tinaSchema } from './.tina/schema'
import { MemoryLevel } from 'memory-level'
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest'
const rootPath = path.join(__dirname, '/')

const level = new MemoryLevel<string, Record<string, any>>({
  valueEncoding: 'json',
})

const fixtures: Fixture[] = [
  {
    name: 'getMovieDocument',
    assert: 'output',
  },
  // {
  //   name: 'getDocument',
  //   assert: 'output',
  // },
  // {
  //   name: 'getDirectorList',
  //   assert: 'output',
  // },
  // {
  //   name: 'getMovieList',
  //   description: 'Trying to filter',
  //   assert: 'output',
  //   expectError: true,
  // },
  // {
  //   name: 'getDirectorDocument',
  //   assert: 'output',
  // },
  // {
  //   name: 'getCollections',
  //   assert: 'output',
  // },
  // {
  //   name: 'getCollection',
  //   assert: 'output',
  // },
]

const mutationFixtures: Fixture[] = [
  {
    name: 'updateDocument',
    description: 'Updating a document works',
    assert: 'file',
    filename: 'content/movies/star-wars.mdx',
  },
]

let consoleErrMock
beforeEach(() => {
  consoleErrMock = vi.spyOn(console, 'error').mockImplementation(() => {})
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
        level,
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
        level,
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
