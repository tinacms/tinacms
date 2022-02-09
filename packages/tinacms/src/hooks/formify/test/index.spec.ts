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
import { renderHook } from '@testing-library/react-hooks'
import { useFormify } from '..'
import { TinaCMS } from '@tinacms/toolkit'
import './to-be-similar-to'
import * as G from 'graphql'
import graphqlJSON from '../../../../../../experimental-examples/unit-test-example/.tina/__generated__/_graphql.json'

/**
 * We're just mocking the tina api so we can mimic the real-world getSchema
 */
const cms = new TinaCMS({
  apis: {
    tina: {
      getSchema: async () => {
        // @ts-ignore
        return G.buildASTSchema(graphqlJSON)
      },
    },
  },
})

const basic = {
  description: 'basic query',
  query: `#graphql
query GetBlockPageDocument($relativePath: String!) {
  myGet: getBlockPageDocument(relativePath: $relativePath) {
    myData: data {
      __typename
      ...BlockPageData
    }
    sys {
      filename
    }
  }
}

fragment BlockPageData on BlockPage {
  title
}
`,
  formifiedQuery: `#graphql
query GetBlockPageDocument($relativePath: String!) {
  myGet: getBlockPageDocument(relativePath: $relativePath) {
    myData: data {
      __typename
      title
    }
    sys {
      filename
    }
    _internalSys: sys {
      path
      collection {
        name
      }
    }
    form
    values
  }
}`,
  nodes: [],
}

const withNestedReference = {
  description: 'with nested reference',
  query: `#graphql
query GetBlockPageDocument($relativePath: String!) {
  myGet: getBlockPageDocument(relativePath: $relativePath) {
    myData: data {
      __typename
      relatedPage {
        ...on PageDocument {
          data {
            title
          }
        }
      }
    }
  }
}
`,
  formifiedQuery: `#graphql
query GetBlockPageDocument($relativePath: String!) {
  myGet: getBlockPageDocument(relativePath: $relativePath) {
    myData: data {
      __typename
      relatedPage {
        ... on PageDocument {
          data {
            title
          }
          _internalSys: sys {
            path
            collection {
              name
            }
          }
          form
          values
        }
      }
    }
    _internalSys: sys {
      path
      collection {
        name
      }
    }
    form
    values
  }
}
`,
  nodes: [],
}

const withNestedReferenceInsideObjectList = {
  description: 'with nested reference inside object list',
  query: `#graphql
query GetBlockPageDocument($relativePath: String!) {
  myGet: getBlockPageDocument(relativePath: $relativePath) {
    myData: data {
      __typename
      social {
        relatedPage {
          __typename
          ...on PageDocument {
            data {
              title
            }
          }
        }
      }
    }
  }
}
`,
  formifiedQuery: `#graphql
query GetBlockPageDocument($relativePath: String!) {
  myGet: getBlockPageDocument(relativePath: $relativePath) {
    myData: data {
      __typename
      social {
        relatedPage {
          __typename
          ... on PageDocument {
            data {
              title
            }
            _internalSys: sys {
              path
              collection {
                name
              }
            }
            form
            values
          }
        }
      }
    }
    _internalSys: sys {
      path
      collection {
        name
      }
    }
    form
    values
  }
}
`,
  nodes: [],
}
const withNestedReferenceInsideObjectList2 = {
  description: 'with nested reference inside object list using templates',
  query: `#graphql
query GetBlockPageDocument($relativePath: String!) {
  myGet: getBlockPageDocument(relativePath: $relativePath) {
    myData: data {
      __typename
      blocks {
        __typename
        ...on BlockPageBlocksHero {
          title
          relation {
            __typename
            ...on PageDocument {
              data {
                title
                relatedPage {
                  __typename
                  ...on BlockPageDocument {
                    data {
                      title
                    }
                  }
                }
              }
            }
          }
        }
        ...on BlockPageBlocksCta {
          action
        }
      }
    }
  }
}
`,
  formifiedQuery: `#graphql
query GetBlockPageDocument($relativePath: String!) {
  myGet: getBlockPageDocument(relativePath: $relativePath) {
    myData: data {
      __typename
      blocks {
        __typename
        ...on BlockPageBlocksHero {
          title
          relation {
            __typename
            ...on PageDocument {
              data {
                title
                relatedPage {
                  __typename
                  ...on BlockPageDocument {
                    data {
                      title
                    }
                    _internalSys: sys {
                      path
                      collection {
                        name
                      }
                    }
                    form
                    values
                  }
                }
              }
              _internalSys: sys {
                path
                collection {
                  name
                }
              }
              form
              values
            }
          }
        }
        ...on BlockPageBlocksCta {
          action
        }
      }
    }
    _internalSys: sys {
      path
      collection {
        name
      }
    }
    form
    values
  }
}
`,
  nodes: [],
}
const withAListQuery = {
  description: 'with nested reference inside object list using templates',
  query: `#graphql
query GetBlockPageList {
  getBlockPageList {
    pageInfo {
      hasPreviousPage
    }
    totalCount
    edges {
      cursor
      node {
        data {
          title
        }
      }
    }
  }
}
`,
  formifiedQuery: `#graphql
query GetBlockPageList {
  getBlockPageList {
    pageInfo {
      hasPreviousPage
    }
    totalCount
    edges {
      cursor
      node {
        data {
          title
        }
        _internalSys: sys {
          path
          collection {
            name
          }
        }
        form
        values
      }
    }
  }
}
`,
  nodes: [],
}
const withAGenericQuery = {
  description: 'with a query that comes from multiple collections',
  query: `#graphql
query {
  getDocument(collection: "block", relativePath: "1.mdx") {
    __typename
    ...on BlockPageDocument {
      data {
        title
      }
    }
  }
}
`,
  formifiedQuery: `#graphql
query QueryOperation {
  getDocument(collection: "block", relativePath: "1.mdx") {
    __typename
    ... on BlockPageDocument {
      data {
        title
      }
      _internalSys: sys {
        path
        collection {
          name
        }
      }
      form
      values
    }
  }
}
`,
  nodes: [],
}

const withACollectionQuery = {
  description: 'with a query that starts with a collection',
  query: `#graphql
query {
  getCollection(collection: "blockPage") {
    name
    documents {
      edges {
        node {
          __typename
          ...on BlockPageDocument {
            id
            data {
              title
            }
          }
        }
      }
    }
  }
}
`,
  formifiedQuery: `#graphql
query QueryOperation {
  getCollection(collection: "blockPage") {
    name
    documents {
      edges {
        node {
          __typename
          ...on BlockPageDocument {
            id
            data {
              title
            }
            _internalSys: sys {
              path
              collection {
                name
              }
            }
            form
            values
          }
        }
      }
    }
  }
}
`,
  nodes: [],
}
const withACollectionsQuery = {
  description: 'with a query that starts with collections',
  query: `#graphql
query {
  getCollection(collection: "blockPage") {
    name
    documents {
      edges {
        node {
          __typename
          ...on BlockPageDocument {
            id
            data {
              title
            }
          }
        }
      }
    }
  }
}
`,
  formifiedQuery: `#graphql
query QueryOperation {
  getCollection(collection: "blockPage") {
    name
    documents {
      edges {
        node {
          __typename
          ... on BlockPageDocument {
            id
            data {
              title
            }
            _internalSys: sys {
              path
              collection {
                name
              }
            }
            form
            values
          }
        }
      }
    }
  }
}
`,
  nodes: [],
}
const withANodeQuery = {
  description: 'with a query uses "node(id: String!)"',
  query: `#graphql
query {
  node(id: "content/block-pages/1.mdx") {
    id
    ...on BlockPageDocument {
      data {
        title
      }
    }
  }
}
`,
  formifiedQuery: `#graphql
query QueryOperation {
  node(id: "content/block-pages/1.mdx") {
    id
    ... on BlockPageDocument {
      data {
        title
      }
      _internalSys: sys {
        path
        collection {
          name
        }
      }
      form
      values
    }
  }
}
`,
  nodes: [],
}
type Test = {
  description: string
  query: string
  formifiedQuery: string
  nodes: unknown[]
}

const queries: Test[] = [
  basic,
  withNestedReference,
  withNestedReferenceInsideObjectList,
  withNestedReferenceInsideObjectList2,
  withAListQuery,
  withAGenericQuery,
  withACollectionQuery,
  withACollectionsQuery,
  withANodeQuery,
]

test.each(queries)(
  'formify $description',
  async ({ query, formifiedQuery, nodes }) => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useFormify({
        query,
        cms,
      })
    )
    // await waitForNextUpdate()
    await waitForNextUpdate()

    expect(result.current.query).toBeSimilarGqlDoc(formifiedQuery)
    expect(result.current.nodes).toEqual(nodes)
  }
)
