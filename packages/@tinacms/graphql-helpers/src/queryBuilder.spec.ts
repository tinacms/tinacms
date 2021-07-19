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

import { formify, splitQuery } from './queryBuilder'
import { buildSchema, parse, print } from 'graphql'
import fs from 'fs'
import path from 'path'
import { gql } from './test-util'

const PATH_TO_TEST_APP = path.join(
  path.resolve(__dirname, '../../..'),
  'apps/test'
)
const PATH_TO_TEST_SCHEMA = path.join(
  PATH_TO_TEST_APP,
  '.tina/__generated__/schema.gql'
)

const query = gql`
  fragment PostDetailsFragment on Post_Details_Data {
    reading_time
  }

  fragment PostFragment on Post_Doc_Data {
    title
    details {
      ...PostDetailsFragment
    }
  }

  query PostQuery {
    getPostsDocument(relativePath: "welcome.md") {
      data {
        __typename
        ...PostFragment
      }
    }
  }
`

describe('formify', () => {
  test('adds Tina form configurations to each node in the query graph', async () => {
    const schema = await fs.readFileSync(PATH_TO_TEST_SCHEMA).toString()
    const formifiedQuery = formify(parse(query), buildSchema(schema))
    expect(print(formifiedQuery)).toEqual(gql`
      fragment PostDetailsFragment on Post_Details_Data {
        reading_time
      }

      fragment PostFragment on Post_Doc_Data {
        title
        details {
          ...PostDetailsFragment
        }
      }

      query PostQuery {
        getPostsDocument(relativePath: "welcome.md") {
          data {
            __typename
            ...PostFragment
          }
          values {
            ... on Post_Doc_Values {
              title
              details {
                reading_time
              }
              author
              _body
              _template
            }
          }
          form {
            ... on Post_Doc_Form {
              label
              name
              fields {
                ... on TextField {
                  name
                  label
                  component
                }
                ... on Post_Details_GroupField {
                  name
                  label
                  component
                  fields {
                    ... on TextField {
                      name
                      label
                      component
                    }
                  }
                }
                ... on SelectField {
                  name
                  label
                  component
                  options
                }
                ... on TextareaField {
                  name
                  label
                  component
                }
              }
            }
          }
          _internalSys: sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
            template
            collection {
              type
              path
              label
              create
              match
              new_doc_ext
              templates
              slug
            }
          }
        }
      }
    `)
  })
})

describe('splitQuery', () => {
  test('includes fragments and nested fragments\n\tand its mutation matches the shape of the query', async () => {
    const schema = await fs.readFileSync(PATH_TO_TEST_SCHEMA).toString()
    const splitNodes = splitQuery({
      queryString: query,
      schema: buildSchema(schema),
    })

    const getPostDocumentQuery = splitNodes.queries['getPostsDocument']

    expect(getPostDocumentQuery.fragments).toEqual(
      expect.arrayContaining(['PostFragment', 'PostDetailsFragment'])
    )
    expect(getPostDocumentQuery.mutation).toEqual(gql`
      mutation updatePostsDocument(
        $relativePath: String!
        $params: Posts_Input!
      ) {
        updatePostsDocument(relativePath: $relativePath, params: $params) {
          data {
            __typename
            ...PostFragment
          }
        }
      }
    `)
  })
})
