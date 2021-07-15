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

const additionalListConfig = {
  use_select: { type: 'boolean' },
  required: { type: 'boolean' },
  min: { type: 'number' },
  max: { type: 'number' },
}

export const ListField = {
  $id: '#listField',
  label: 'List Field',
  description:
    'A list of strings to make multiple selections. The selection is displayed as a list that can be sorted (e.g. related pages). ',
  type: 'object',
  properties: {
    type: {
      const: 'list',
    },
    ...base,
    default: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    config: {
      type: 'object',
      properties: {
        use_select: { type: 'boolean' },
        source: {
          type: 'object',
          properties: {
            type: { enum: ['simple', 'pages', 'documents'] },
          },
        },
      },
      allOf: [
        {
          if: {
            properties: {
              use_select: { const: false },
            },
          },
          then: {
            additionalProperties: false,
            properties: additionalListConfig,
          },
          else: {
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
                  required: ['source', 'options'],
                  properties: {
                    ...additionalListConfig,
                    options: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    source: {
                      properties: {
                        type: { const: 'simple' },
                      },
                      required: ['type'],
                      additionalProperties: false,
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
                    ...additionalListConfig,
                    source: {
                      properties: {
                        type: { const: 'pages' },
                        section: { type: 'string' },
                      },
                      required: ['type', 'section'],
                      additionalProperties: false,
                    },
                  },
                  required: ['source'],
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
                    ...additionalListConfig,
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
                  required: ['source'],
                  additionalProperties: false,
                },
              },
            ],
          },
        },
      ],
    },
  },
  additionalProperties: false,
  required: baseRequired,
}
