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

import {
  GraphQLSchema,
  DocumentNode,
  getNamedType,
  GraphQLObjectType,
} from 'graphql'
import { friendlyName } from './util'
import { buildSelectionsFields } from './queryBuilder'

/**
 *
 * This generates a query to a "reasonable" depth for the data key of a given collection
 * It's not meant for production use
 */
export const queryGenerator = (
  variables: { relativePath: string; collection: string },
  schema: GraphQLSchema
): DocumentNode => {
  const t = schema.getQueryType()
  const queryFields = t?.getFields()
  if (queryFields) {
    const queryName = `get${friendlyName(variables.collection)}Document`
    const queryField = queryFields[queryName]

    const returnType = getNamedType(queryField.type)
    if (returnType instanceof GraphQLObjectType) {
      let depth = 0
      const fields = buildSelectionsFields(
        Object.values(returnType.getFields()).filter(
          (field) => field.name === 'data'
        ),
        (fields) => {
          const filteredFieldsList = [
            'sys',
            '__typename',
            'template',
            'html',
            'form',
            'values',
            'markdownAst',
          ]
          depth = depth + 1
          const filteredFields = fields.filter((field) => {
            return !filteredFieldsList.includes(field.name)
          })

          return { continue: depth < 5, filteredFields }
        }
      )

      return {
        kind: 'Document' as const,
        definitions: [
          {
            kind: 'OperationDefinition' as const,
            operation: 'query',
            name: {
              kind: 'Name' as const,
              value: queryName,
            },
            variableDefinitions: [
              {
                kind: 'VariableDefinition' as const,
                variable: {
                  kind: 'Variable' as const,
                  name: {
                    kind: 'Name' as const,
                    value: 'relativePath',
                  },
                },
                type: {
                  kind: 'NonNullType' as const,
                  type: {
                    kind: 'NamedType' as const,
                    name: {
                      kind: 'Name' as const,
                      value: 'String',
                    },
                  },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: {
                    kind: 'Name',
                    value: queryName,
                  },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: {
                        kind: 'Name',
                        value: 'relativePath',
                      },
                      value: {
                        kind: 'Variable',
                        name: {
                          kind: 'Name',
                          value: 'relativePath',
                        },
                      },
                    },
                  ],
                  directives: [],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: fields,
                  },
                },
              ],
            },
          },
        ],
      }
    } else {
      throw new Error('Expected return type to be an instance of GraphQLObject')
    }
  } else {
    throw new Error('Unable to find query fields for provided schema')
  }
}
