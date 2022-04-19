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

import { LevelStore } from './level'
import { IndexDefinition, OP } from './index'

const titlePrefix = 'Document'
const collection = 'posts'
const dateAscSort = (
  a: [string, { date: string }],
  b: [string, { date: string }]
) => new Date(a[1].date).getTime() - new Date(b[1].date).getTime()
const dateDescSort = (
  a: [string, { date: string }],
  b: [string, { date: string }]
) => new Date(b[1].date).getTime() - new Date(a[1].date).getTime()
const titleAscSort = (
  a: [string, { title: string }],
  b: [string, { title: string }]
) => {
  return a[1].title.localeCompare(b[1].title)
}
const titleDescSort = (
  a: [string, { title: string }],
  b: [string, { title: string }]
) => {
  return b[1].title.localeCompare(a[1].title)
}
const idAscSort = (a: [string, { id: number }], b: [string, { id: number }]) =>
  a[1].id - b[1].id
const idDescSort = (a: [string, { id: number }], b: [string, { id: number }]) =>
  b[1].id - a[1].id
const pathMapper = (a: [string, any]) => a[0]
const partition = (array: any, n: number): any[] =>
  array.length ? [array.splice(0, n)].concat(partition(array, n)) : []
const validateResult = (result: any, expectedDocs: any[], limit?: number) => {
  expect(result).toBeDefined()
  expect(result.edges).toHaveLength(limit ? limit : expectedDocs.length)
  for (const [i, expectedDoc] of Object.entries(expectedDocs)) {
    if (limit && Number(i) >= limit) {
      break
    }

    expect(result.edges[i].path).toEqual(expectedDoc)
  }
}

describe('LevelDB store', () => {
  let mockDocuments: Record<
    string,
    {
      title: string
      published: boolean
      date: string
      id: number
    }
  >
  let mockIndexes: Record<string, IndexDefinition>
  beforeEach(() => {
    mockDocuments = {
      'posts/document_1': {
        title: `${titlePrefix} 1`,
        published: true,
        date: '2021-04-14T07:00:00.000Z',
        id: 0,
      },
      'posts/document_2': {
        title: `${titlePrefix} 2`,
        published: true,
        date: '2021-04-13T07:00:00.000Z',
        id: 1,
      },
      'posts/document_3': {
        title: `${titlePrefix} 3`,
        published: true,
        date: '2021-04-12T07:00:00.000Z',
        id: 2,
      },
      'posts/document_4': {
        title: `${titlePrefix} 4`,
        published: false,
        date: '2021-04-11T07:00:00.000Z',
        id: 3,
      },
    }
    mockIndexes = {
      title: {
        fields: [
          {
            type: 'string',
            name: 'title',
          },
        ],
      },
      date: {
        fields: [
          {
            type: 'datetime',
            name: 'date',
          },
        ],
      },
      id: {
        fields: [
          {
            type: 'number',
            name: 'id',
          },
        ],
      },
      publishedDateIdx: {
        fields: [
          {
            type: 'boolean',
            name: 'published',
          },
          {
            type: 'datetime',
            name: 'date',
          },
        ],
      },
    }
  })

  describe('seed', () => {
    it('succeeds', async () => {
      const store = new LevelStore('', true)
      for (const path of Object.keys(mockDocuments)) {
        await store.seed(path, mockDocuments[path], {
          collection,
          indexDefinitions: mockIndexes,
        })
      }
    })
  })

  describe('query', () => {
    let store: LevelStore
    beforeEach(async () => {
      store = new LevelStore('', true)
      for (const path of Object.keys(mockDocuments)) {
        await store.seed(path, mockDocuments[path], {
          collection,
          indexDefinitions: mockIndexes,
        })
      }
    })

    describe('single string column index with filter', () => {
      it('sorts by title asc', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .sort(titleAscSort)
          .map(pathMapper)
        const limit = 3
        const result = await store.query({
          collection,
          filterChain: [],
          limit,
          sort: 'title',
        })

        validateResult(result, expectedDocs, limit)
      })

      it('sorts by title desc', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .sort(titleDescSort)
          .map(pathMapper)
        const limit = 3
        const result = await store.query({
          collection,
          filterChain: [],
          limit,
          sort: 'title',
          reverse: true,
        })

        validateResult(result, expectedDocs, limit)
      })

      it('filters with equals string', async () => {
        const path = 'posts/document_1'
        const result = await store.query({
          filterChain: [
            {
              pathExpression: 'title',
              rightOperand: mockDocuments[path].title,
              operator: OP.EQ,
              type: 'string',
            },
          ],
          collection,
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(1)
        expect(result.edges[0].path).toEqual(path)
      })

      it('filters with begins with string', async () => {
        const limit = 2
        // add document with different title prefix
        const path = 'posts/document_x'
        mockDocuments[path] = {
          title: '1 document x',
          published: true,
          date: '2021-04-15T07:00:00.000Z',
          id: Object.keys(mockDocuments).length + 1,
        }
        await store.seed(path, mockDocuments[path], {
          collection,
          indexDefinitions: mockIndexes,
        })
        const expectedDocs = Object.entries(mockDocuments)
          .sort(titleAscSort)
          .filter((doc) => doc[1].title.startsWith(titlePrefix))
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'title',
              rightOperand: titlePrefix,
              operator: OP.STARTS_WITH,
              type: 'string',
            },
          ],
          limit,
          sort: 'title',
        })

        validateResult(result, expectedDocs, limit)
      })

      it('filters with invalid operator', async () => {
        const path = 'posts/document_1'
        await expect(
          store.query({
            collection,
            filterChain: [
              {
                pathExpression: 'title',
                rightOperand: mockDocuments[path].title,
                operator: 'ends_with' as any,
                type: 'string',
              },
            ],
            sort: 'title',
          })
        ).rejects.toThrowError('unexpected operator ends_with')
      })
    })

    describe('single datetime column index with filter', () => {
      it('sorts by date asc', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .sort(dateAscSort)
          .map(pathMapper)
        const limit = 3
        const result = await store.query({
          collection,
          filterChain: [],
          indexDefinitions: mockIndexes,
          limit,
          sort: 'date',
        })

        validateResult(result, expectedDocs, limit)
      })

      it('sorts by date desc', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .sort(dateDescSort)
          .map(pathMapper)
        const limit = 3
        const result = await store.query({
          collection,
          filterChain: [],
          indexDefinitions: mockIndexes,
          limit,
          sort: 'date',
          reverse: true,
        })

        validateResult(result, expectedDocs, limit)
      })

      it('filters by equal', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(dateAscSort)
        const expectedDocs = sortedDocs.map(pathMapper)
        const filterDate = sortedDocs[0][1].date
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'date',
              rightOperand: filterDate,
              operator: OP.EQ,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'date',
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(1)
        expect(result.edges[0].path).toEqual(expectedDocs[0])
      })

      it('filters by GT', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(dateAscSort)
        const cutoffDate = sortedDocs[0][1].date
        const expectedDocs = sortedDocs
          .filter(
            (doc) =>
              new Date(doc[1].date).getTime() > new Date(cutoffDate).getTime()
          )
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'date',
              rightOperand: cutoffDate,
              operator: OP.GT,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'date',
        })

        validateResult(result, expectedDocs)
      })

      it('filters by GTE', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(dateAscSort)
        const cutoffDate = sortedDocs[0][1].date
        const expectedDocs = sortedDocs
          .filter(
            (doc) =>
              new Date(doc[1].date).getTime() >= new Date(cutoffDate).getTime()
          )
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'date',
              rightOperand: cutoffDate,
              operator: OP.GTE,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'date',
        })

        validateResult(result, expectedDocs)
      })

      it('filters by LT', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(dateAscSort)
        const cutoffDate = sortedDocs[0][1].date
        const expectedDocs = sortedDocs
          .filter(
            (doc) =>
              new Date(doc[1].date).getTime() < new Date(cutoffDate).getTime()
          )
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'date',
              rightOperand: cutoffDate,
              operator: OP.LT,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'date',
        })

        validateResult(result, expectedDocs)
      })

      it('filters by LTE', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(dateAscSort)
        const cutoffDate = sortedDocs[0][1].date
        const expectedDocs = sortedDocs
          .filter(
            (doc) =>
              new Date(doc[1].date).getTime() <= new Date(cutoffDate).getTime()
          )
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'date',
              rightOperand: cutoffDate,
              operator: OP.LTE,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'date',
        })

        validateResult(result, expectedDocs)
      })
    })

    describe('single number column index with filter', () => {
      it('sorts by id asc', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .sort(idAscSort)
          .map(pathMapper)
        const limit = 3
        const result = await store.query({
          collection,
          filterChain: [],
          limit,
          sort: 'id',
        })

        validateResult(result, expectedDocs, limit)
      })

      it('sorts by id desc', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .sort(idDescSort)
          .map(pathMapper)
        const limit = 3
        const result = await store.query({
          collection,
          filterChain: [],
          limit,
          sort: 'id',
          reverse: true,
        })

        validateResult(result, expectedDocs, limit)
      })

      it('paginates asc', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .sort(idAscSort)
          .map(pathMapper)
        const limit = 2
        const pages = partition(expectedDocs, 2)
        let cursor: string
        for (const page of pages) {
          const query = {
            collection,
            filterChain: [],
            limit,
            sort: 'id',
          }

          if (cursor) {
            query['gt'] = cursor
          }

          const result = await store.query(query)
          cursor = result.pageInfo.endCursor

          validateResult(result, page)
        }
      })

      it('paginates desc', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .sort(idDescSort)
          .map(pathMapper)
        const limit = 2
        const pages = partition(expectedDocs, 2)
        let cursor: string
        for (const page of pages) {
          const query = {
            collection,
            filterChain: [],
            limit,
            sort: 'id',
            reverse: true,
          }

          if (cursor) {
            query['lt'] = cursor
          }

          const result = await store.query(query)
          cursor = result.pageInfo.endCursor

          validateResult(result, page)
        }
      })

      it('filters by equal', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(idAscSort)
        const expectedDocs = sortedDocs.map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'id',
              rightOperand: sortedDocs[0][1].id,
              operator: OP.EQ,
              type: 'number',
            },
          ],
          sort: 'id',
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(1)
        expect(result.edges[0].path).toEqual(expectedDocs[0])
      })

      it('filters by GT', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(idAscSort)
        const cutoffId = sortedDocs[0][1].id
        const expectedDocs = sortedDocs
          .filter((doc) => doc[1].id > cutoffId)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'id',
              rightOperand: cutoffId,
              operator: OP.GT,
              type: 'number',
            },
          ],
          sort: 'id',
        })

        validateResult(result, expectedDocs)
      })

      it('filters by GTE', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(idAscSort)
        const cutoffId = sortedDocs[0][1].id
        const expectedDocs = sortedDocs
          .filter((doc) => doc[1].id >= cutoffId)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'id',
              rightOperand: cutoffId,
              operator: OP.GTE,
              type: 'number',
            },
          ],
          sort: 'id',
        })

        validateResult(result, expectedDocs)
      })

      it('filters by LT', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(idAscSort)
        const cutoffId = sortedDocs[0][1].id
        const expectedDocs = sortedDocs
          .filter((doc) => doc[1].id < cutoffId)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'id',
              rightOperand: cutoffId,
              operator: OP.LT,
              type: 'number',
            },
          ],
          sort: 'id',
        })

        validateResult(result, expectedDocs)
      })

      it('filters by LTE', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(idAscSort)
        const cutoffId = sortedDocs[0][1].id
        const expectedDocs = sortedDocs
          .filter((doc) => doc[1].id <= cutoffId)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'id',
              rightOperand: cutoffId,
              operator: OP.LTE,
              type: 'number',
            },
          ],
          sort: 'id',
        })

        validateResult(result, expectedDocs)
      })

      it('id >= val < id', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(idAscSort)
        const leftCutoff = sortedDocs[0][1].id
        const rightCutoff = sortedDocs[1][1].id
        const expectedDocs = sortedDocs
          .filter((doc) => doc[1].id >= leftCutoff && doc[1].id < rightCutoff)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'id',
              leftOperand: leftCutoff,
              rightOperand: rightCutoff,
              leftOperator: OP.GTE,
              rightOperator: OP.LT,
              type: 'number',
            },
          ],
          sort: 'id',
        })

        validateResult(result, expectedDocs)
      })

      it('id > val < id', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(idAscSort)
        const leftCutoff = sortedDocs[0][1].id
        const rightCutoff = sortedDocs[1][1].id
        const expectedDocs = sortedDocs
          .filter((doc) => doc[1].id > leftCutoff && doc[1].id < rightCutoff)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'id',
              leftOperand: leftCutoff,
              rightOperand: rightCutoff,
              leftOperator: OP.GT,
              rightOperator: OP.LT,
              type: 'number',
            },
          ],
          sort: 'id',
        })

        validateResult(result, expectedDocs)
      })

      it('id > val <= id', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(idAscSort)
        const leftCutoff = sortedDocs[0][1].id
        const rightCutoff = sortedDocs[1][1].id
        const expectedDocs = sortedDocs
          .filter((doc) => doc[1].id > leftCutoff && doc[1].id <= rightCutoff)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'id',
              leftOperand: leftCutoff,
              rightOperand: rightCutoff,
              leftOperator: OP.GT,
              rightOperator: OP.LTE,
              type: 'number',
            },
          ],
          sort: 'id',
        })

        validateResult(result, expectedDocs)
      })

      it('id >= val <= id', async () => {
        const sortedDocs = Object.entries(mockDocuments).sort(idAscSort)
        const leftCutoff = sortedDocs[0][1].id
        const rightCutoff = sortedDocs[1][1].id
        const expectedDocs = sortedDocs
          .filter((doc) => doc[1].id >= leftCutoff && doc[1].id <= rightCutoff)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'id',
              leftOperand: leftCutoff,
              rightOperand: rightCutoff,
              leftOperator: OP.GTE,
              rightOperator: OP.LTE,
              type: 'number',
            },
          ],
          sort: 'id',
        })

        validateResult(result, expectedDocs)
      })
    })

    describe('multi-column boolean + datetime index with filter', () => {
      it('published sorted by date', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateAscSort)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
        })

        validateResult(result, expectedDocs)
      })

      it('published sorted by date desc', async () => {
        const expectedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateDescSort)
          .map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
          reverse: true,
        })

        validateResult(result, expectedDocs)
      })

      it('published after date', async () => {
        let sortedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateAscSort)
        const cutoffDate = sortedDocs[0][1].date
        sortedDocs = sortedDocs.filter(
          (doc) =>
            new Date(doc[1].date).getTime() > new Date(cutoffDate).getTime()
        )
        const expectedDocs = sortedDocs.map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
            {
              pathExpression: 'date',
              rightOperand: cutoffDate,
              operator: OP.GT,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(expectedDocs.length)
        expect(result.edges[0].path).toEqual(expectedDocs[0])
        expect(result.edges[1].path).toEqual(expectedDocs[1])
      })

      it('published gte date', async () => {
        let sortedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateAscSort)
        const cutoffDate = sortedDocs[0][1].date
        sortedDocs = sortedDocs.filter(
          (doc) =>
            new Date(doc[1].date).getTime() >= new Date(cutoffDate).getTime()
        )
        const expectedDocs = sortedDocs.map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
            {
              pathExpression: 'date',
              rightOperand: cutoffDate,
              operator: OP.GTE,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
        })

        validateResult(result, expectedDocs)
      })

      it('published before date', async () => {
        let sortedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateDescSort)
        const cutoffDate = sortedDocs[0][1].date
        sortedDocs = sortedDocs.filter(
          (doc) =>
            new Date(doc[1].date).getTime() < new Date(cutoffDate).getTime()
        )
        const expectedDocs = sortedDocs.map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
            {
              pathExpression: 'date',
              rightOperand: cutoffDate,
              operator: OP.LT,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
          reverse: true,
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(expectedDocs.length)
        expect(result.edges[0].path).toEqual(expectedDocs[0])
        expect(result.edges[1].path).toEqual(expectedDocs[1])
      })

      it('published lte date', async () => {
        let sortedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateDescSort)
        const cutoffDate = sortedDocs[0][1].date
        sortedDocs = sortedDocs.filter(
          (doc) =>
            new Date(doc[1].date).getTime() <= new Date(cutoffDate).getTime()
        )
        const expectedDocs = sortedDocs.map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
            {
              pathExpression: 'date',
              rightOperand: cutoffDate,
              operator: OP.LTE,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
          reverse: true,
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(expectedDocs.length)
        expect(result.edges[0].path).toEqual(expectedDocs[0])
        expect(result.edges[1].path).toEqual(expectedDocs[1])
      })

      it('published date >= val < date', async () => {
        let sortedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateAscSort)
        const cutoffDoc = sortedDocs[0][1]
        const leftCutoff = cutoffDoc.date
        const rightCutoff = String(
          new Date(new Date(cutoffDoc.date).getTime() + 60 * 60 * 1000)
        )
        sortedDocs = sortedDocs.filter((doc) => {
          const time = new Date(doc[1].date).getTime()
          return (
            time >= new Date(leftCutoff).getTime() &&
            time < new Date(rightCutoff).getTime()
          )
        })
        const expectedDocs = sortedDocs.map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
            {
              pathExpression: 'date',
              leftOperand: leftCutoff,
              rightOperand: rightCutoff,
              leftOperator: OP.GTE,
              rightOperator: OP.LT,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(1)
        expect(result.edges[0].path).toEqual(expectedDocs[0])
      })

      it('published date > val < date', async () => {
        let sortedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateAscSort)
        const cutoffDoc = sortedDocs[0][1]
        const leftCutoff = String(
          new Date(new Date(cutoffDoc.date).getTime() - 60 * 60 * 1000)
        )
        const rightCutoff = String(
          new Date(new Date(cutoffDoc.date).getTime() + 60 * 60 * 1000)
        )
        sortedDocs = sortedDocs.filter((doc) => {
          const time = new Date(doc[1].date).getTime()
          return (
            time > new Date(leftCutoff).getTime() &&
            time < new Date(rightCutoff).getTime()
          )
        })
        const expectedDocs = sortedDocs.map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
            {
              pathExpression: 'date',
              leftOperand: leftCutoff,
              rightOperand: rightCutoff,
              leftOperator: OP.GT,
              rightOperator: OP.LT,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(1)
        expect(result.edges[0].path).toEqual(expectedDocs[0])
      })

      it('published date > val <= date', async () => {
        let sortedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateAscSort)
        const leftCutoff = String(
          new Date(new Date(sortedDocs[0][1].date).getTime())
        )
        const rightCutoff = String(
          new Date(new Date(sortedDocs[1][1].date).getTime())
        )
        sortedDocs = sortedDocs.filter((doc) => {
          const time = new Date(doc[1].date).getTime()
          return (
            time > new Date(leftCutoff).getTime() &&
            time <= new Date(rightCutoff).getTime()
          )
        })
        const expectedDocs = sortedDocs.map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
            {
              pathExpression: 'date',
              leftOperand: leftCutoff,
              rightOperand: rightCutoff,
              leftOperator: OP.GT,
              rightOperator: OP.LTE,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(1)
        expect(result.edges[0].path).toEqual(expectedDocs[0])
      })

      it('published date >= val <= date', async () => {
        let sortedDocs = Object.entries(mockDocuments)
          .filter((doc) => doc[1].published)
          .sort(dateAscSort)
        const leftCutoff = String(
          new Date(new Date(sortedDocs[0][1].date).getTime() + 60 * 60 * 1000)
        )
        const rightCutoff = String(
          new Date(new Date(sortedDocs[1][1].date).getTime())
        )
        sortedDocs = sortedDocs.filter((doc) => {
          const time = new Date(doc[1].date).getTime()
          return (
            time >= new Date(leftCutoff).getTime() &&
            time <= new Date(rightCutoff).getTime()
          )
        })
        const expectedDocs = sortedDocs.map(pathMapper)
        const result = await store.query({
          collection,
          filterChain: [
            {
              pathExpression: 'published',
              rightOperand: true,
              operator: OP.EQ,
              type: 'boolean',
            },
            {
              pathExpression: 'date',
              leftOperand: leftCutoff,
              rightOperand: rightCutoff,
              leftOperator: OP.GTE,
              rightOperator: OP.LTE,
              type: 'datetime',
            },
          ],
          indexDefinitions: mockIndexes,
          sort: 'publishedDateIdx',
        })

        expect(result).toBeDefined()
        expect(result.edges).toHaveLength(1)
        expect(result.edges[0].path).toEqual(expectedDocs[0])
      })
    })
  })
})
