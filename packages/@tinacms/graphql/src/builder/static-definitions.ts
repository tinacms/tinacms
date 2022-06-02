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

import { astBuilder } from '../ast-builder'

/**
 * Definitions for static interfaces which are identical
 * for any schema, ex. Node
 */
const interfaceDefinitions = [
  astBuilder.InterfaceTypeDefinition({
    name: 'Node',
    fields: [
      astBuilder.FieldDefinition({
        name: 'id',
        type: astBuilder.TYPES.ID,
        required: true,
      }),
    ],
  }),
  astBuilder.InterfaceTypeDefinition({
    name: 'Document',
    fields: [
      astBuilder.FieldDefinition({
        name: 'id',
        type: astBuilder.TYPES.ID,
        required: true,
      }),
      astBuilder.FieldDefinition({
        name: '_sys',
        type: astBuilder.TYPES.SystemInfo,
      }),
      astBuilder.FieldDefinition({
        name: '_values',
        type: astBuilder.TYPES.JSON,
        required: true,
      }),
    ],
  }),
  astBuilder.InterfaceTypeDefinition({
    name: 'Connection',
    description: 'A relay-compliant pagination connection',
    fields: [
      astBuilder.FieldDefinition({
        name: 'totalCount',
        required: true,
        type: astBuilder.TYPES.Number,
      }),
      astBuilder.FieldDefinition({
        name: 'pageInfo',
        required: true,
        type: astBuilder.ObjectTypeDefinition({
          name: 'PageInfo',
          fields: [
            astBuilder.FieldDefinition({
              name: 'hasPreviousPage',
              required: true,
              type: astBuilder.TYPES.Boolean,
            }),
            astBuilder.FieldDefinition({
              name: 'hasNextPage',
              required: true,
              type: astBuilder.TYPES.Boolean,
            }),
            astBuilder.FieldDefinition({
              name: 'startCursor',
              required: true,
              type: astBuilder.TYPES.String,
            }),
            astBuilder.FieldDefinition({
              name: 'endCursor',
              required: true,
              type: astBuilder.TYPES.String,
            }),
          ],
        }),
      }),
    ],
  }),
]

/**
 * Definitions for additional scalars, ex. JSON
 */
const scalarDefinitions = [
  astBuilder.ScalarTypeDefinition({
    name: 'Reference',
    description: 'References another document, used as a foreign key',
  }),
  astBuilder.ScalarTypeDefinition({ name: 'JSON' }),
  astBuilder.ObjectTypeDefinition({
    name: 'SystemInfo',
    fields: [
      astBuilder.FieldDefinition({
        name: 'filename',
        required: true,
        type: astBuilder.TYPES.String,
      }),
      astBuilder.FieldDefinition({
        name: 'title',
        required: false,
        type: astBuilder.TYPES.String,
      }),
      astBuilder.FieldDefinition({
        name: 'basename',
        required: true,
        type: astBuilder.TYPES.String,
      }),
      astBuilder.FieldDefinition({
        name: 'breadcrumbs',
        required: true,
        type: astBuilder.TYPES.String,
        list: true,
        args: [
          astBuilder.InputValueDefinition({
            name: 'excludeExtension',
            type: astBuilder.TYPES.Boolean,
          }),
        ],
      }),
      astBuilder.FieldDefinition({
        name: 'path',
        required: true,
        type: astBuilder.TYPES.String,
      }),
      astBuilder.FieldDefinition({
        name: 'relativePath',
        required: true,
        type: astBuilder.TYPES.String,
      }),
      astBuilder.FieldDefinition({
        name: 'extension',
        required: true,
        type: astBuilder.TYPES.String,
      }),
      astBuilder.FieldDefinition({
        name: 'template',
        required: true,
        type: astBuilder.TYPES.String,
      }),
      astBuilder.FieldDefinition({
        name: 'collection',
        required: true,
        type: astBuilder.TYPES.Collection,
      }),
    ],
  }),
  astBuilder.ObjectTypeDefinition({
    name: 'PageInfo',
    fields: [
      astBuilder.FieldDefinition({
        name: 'hasPreviousPage',
        required: true,
        type: astBuilder.TYPES.Boolean,
      }),
      astBuilder.FieldDefinition({
        name: 'hasNextPage',
        required: true,
        type: astBuilder.TYPES.Boolean,
      }),
      astBuilder.FieldDefinition({
        name: 'startCursor',
        required: true,
        type: astBuilder.TYPES.String,
      }),
      astBuilder.FieldDefinition({
        name: 'endCursor',
        required: true,
        type: astBuilder.TYPES.String,
      }),
    ],
  }),
]

export const staticDefinitions = [...scalarDefinitions, interfaceDefinitions]
