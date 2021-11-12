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
const consoleErrMock = jest.spyOn(console, 'error').mockImplementation()

const fixtures: Fixture[] = [
  // {
  //   description: 'Adding a document',
  //   name: 'addPendingDocument',
  //   assert: 'output',
  // },
  // {
  //   description: 'Adding a document that already exists',
  //   name: 'addPendingDocument-existing',
  //   assert: 'output',
  //   expectError: true,
  // },
  // {
  //   description: 'Updating a document',
  //   name: 'updateDocument',
  //   assert: 'file',
  //   filename: 'content/movies/star-wars.md',
  // },
  // {
  //   name: 'getMovieDocument',
  //   assert: 'output',
  // },
  // {
  //   name: 'getMovieList',
  //   description: "Querying a list with 'eq'",
  //   assert: 'output',
  // },
  // {
  //   name: 'getMovieList2',
  //   description: "Querying a list with 'startsWith'",
  //   assert: 'output',
  // },
  // {
  //   name: 'getDocument',
  //   assert: 'output',
  // },
  // {
  //   name: 'getDirectorList',
  //   assert: 'output',
  // },
  {
    name: 'getDirectorDocument',
    assert: 'output',
  },
  // {
  //   name: 'getCollections',
  //   assert: 'output',
  // },
  // {
  //   name: 'getCollection',
  //   assert: 'output',
  // },
]
jest.setTimeout(200000) // in milliseconds

describe('A schema with indexing', () => {
  fixtures.forEach((fixture) => {
    it(print(fixture), async () => {
      const { response, expectedResponsePath } = await setupFixture2(
        rootPath,
        tinaSchema,
        store,
        fixture,
        'movies-with-datalayer'
      )

      if (fixture.expectError) {
        expect(consoleErrMock).toHaveBeenCalled()
      }

      expect(response).toMatchFile(expectedResponsePath)
    })
  })
})
