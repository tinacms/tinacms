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

import { auditDocuments } from './audit'
import { AuditError } from './issue'

jest.mock('./validations/validateRichText', () => {
  return {
    validateRichText: jest.fn(() => [new AuditError('oops', '')]),
  }
})
jest.mock('./validations/validateMutations', () => {
  return {
    validateMutations: jest.fn(() => [new AuditError('oops', '')]),
  }
})

const emptyCollectionResponse = {
  data: {
    postConnection: {
      edges: [],
      pageInfo: {
        endCursor: 'foo',
        hasNextPage: false,
      },
    },
  },
}

const firstPageResponse = {
  data: {
    postConnection: {
      edges: [
        {
          node: {
            _values: {
              date: '2021-07-12T07:00:00.000Z',
            },
          },
        },
        {
          node: {
            _values: {
              date: '2021-07-12T07:00:00.000Z',
            },
          },
        },
      ],
      pageInfo: {
        endCursor: 'foo',
        hasNextPage: true,
      },
    },
  },
}

const lastPageResponse = {
  data: {
    postConnection: {
      edges: [
        {
          node: {
            _values: {
              date: '2021-07-12T07:00:00.000Z',
            },
          },
        },
      ],
      pageInfo: {
        endCursor: 'foo2',
        hasNextPage: false,
      },
    },
  },
}

describe('audit', () => {
  describe('with no documents', () => {
    test('reports no issues', async () => {
      const result = await auditDocuments({
        collection: {
          name: 'post',
          templates: [],
          path: 'content/posts',
        },
        resolve: jest
          .fn()
          .mockImplementationOnce(() =>
            Promise.resolve(emptyCollectionResponse)
          ),
        rootPath: 'posts/foo',
        useDefaultValues: false,
      })

      expect(result.length).toEqual(0) // 2 errors per document, 3 documents
    })
  })

  describe('with paged collection', () => {
    test('audits every document', async () => {
      const result = await auditDocuments({
        collection: {
          name: 'post',
          templates: [],
          path: 'content/posts',
        },
        resolve: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve(firstPageResponse))
          .mockImplementationOnce(() => Promise.resolve(lastPageResponse)),
        rootPath: 'posts/foo',
        useDefaultValues: false,
      })

      expect(result.length).toEqual(6) // 2 errors per document, 3 documents
    })
  })
})
