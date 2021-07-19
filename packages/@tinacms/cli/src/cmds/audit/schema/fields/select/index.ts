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

import { base, baseRequired } from '../common'

export const SelectField = {
  $id: '#selectField',
  label: 'Select Field',
  description: 'A dropdown to make a single selection from a set of options. ',
  type: 'object',
  properties: {
    type: {
      const: 'select',
    },
    ...base,
    default: {
      type: 'string',
      removeIfFails: true, // we put [] as a default value in lots of places
    },
    config: {
      type: 'object',
      properties: {
        source: {
          type: 'object',
          properties: {
            // FIXME: this doesnt look right
            type: { enum: ['simple', 'pages', 'documents'] },
          },
        },
      },
      allOf: [
        {
          if: {
            properties: {
              source: {
                properties: {
                  type: { const: 'simple' },
                },
              },
            },
          },
          then: {
            additionalProperties: false,
            required: ['options', 'source'],
            properties: {
              required: { type: 'boolean' },
              source: {
                properties: {
                  type: { const: 'simple' },
                },
                required: ['type'],
                additionalProperties: false,
              },
              options: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
        {
          if: {
            properties: {
              source: {
                properties: {
                  type: { const: 'pages' },
                },
              },
            },
          },
          then: {
            properties: {
              required: { type: 'boolean' },
              source: {
                properties: {
                  type: { const: 'pages' },
                  section: { type: 'string' },
                },
                required: ['type', 'section'],
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        },
        {
          if: {
            properties: {
              source: {
                properties: {
                  type: { const: 'documents' },
                },
              },
            },
          },
          then: {
            properties: {
              required: { type: 'boolean' },
              source: {
                properties: {
                  type: { const: 'documents' },
                  section: { type: 'string' },
                  file: { type: 'string' },
                  path: { type: 'string' },
                },
                required: ['type', 'section', 'file', 'path'],
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
        },
      ],
    },
  },
  additionalProperties: false,
  required: baseRequired,
}
