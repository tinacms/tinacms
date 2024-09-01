/**

*/

import path from 'path'
import { setupFixture, setupFixture2, print, Fixture } from '../setup'
import { tinaSchema } from './.tina/schema'
import { MemoryLevel } from 'memory-level'
import {
  beforeEach,
  afterEach,
  describe,
  it,
  expect,
  vi,
  SpyInstance,
} from 'vitest'
const rootPath = path.join(__dirname, '/')

const level = new MemoryLevel<string, Record<string, any>>({
  valueEncoding: 'json',
})

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
  {
    name: 'createDocument',
    description: 'Creating a document',
    assert: 'file',
    filename: 'content/stuff/my-stuff.md',
  },
  {
    name: 'updateDocument',
    description: 'Updating a document',
    assert: 'file',
    filename: 'content/posts/hello-world.md',
  },
]

beforeEach(async () => {
  await level.clear()
})

let consoleErrMock: SpyInstance
beforeEach(() => {
  consoleErrMock = vi.spyOn(console, 'error').mockImplementation(() => {})
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
        level,
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
        level,
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
