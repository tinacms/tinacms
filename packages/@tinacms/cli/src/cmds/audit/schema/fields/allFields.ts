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

export const AllFields = {
  $id: '#allFields',
  type: 'array',
  title: 'Field List',
  description: 'List of fields for your FMT',
  items: {
    type: 'object',
    required: ['type'],
    properties: {
      type: {
        type: 'string',
        enum: [
          'text',
          'textarea',
          'include',
          'datetime',
          'select',
          'file',
          'blocks',
          'color',
          'boolean',
          'tag_list',
          'number',
          'image_gallery',
          'list',
          'field_group',
          'field_group_list',
        ],
      },
    },
    allOf: [
      {
        if: {
          properties: {
            type: { const: 'text' },
          },
        },
        then: {
          $ref: '#/definitions/textField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'blocks' },
          },
        },
        then: {
          $ref: '#/definitions/blocksField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'number' },
          },
        },
        then: {
          $ref: '#/definitions/numberField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'include' },
          },
        },
        then: {
          $ref: '#/definitions/includeField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'color' },
          },
        },
        then: {
          $ref: '#/definitions/colorField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'tag_list' },
          },
        },
        then: {
          $ref: '#/definitions/tagField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'datetime' },
          },
        },
        then: {
          $ref: '#/definitions/dateField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'textarea' },
          },
        },
        then: {
          $ref: '#/definitions/textAreaField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'select' },
          },
        },
        then: {
          $ref: '#/definitions/selectField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'file' },
          },
        },
        then: {
          $ref: '#/definitions/imageField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'boolean' },
          },
        },
        then: {
          $ref: '#/definitions/booleanField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'image_gallery' },
          },
        },
        then: {
          $ref: '#/definitions/galleryField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'field_group' },
          },
        },
        then: {
          $ref: '#/definitions/fieldGroupField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'field_group_list' },
          },
        },
        then: {
          $ref: '#/definitions/fieldGroupListField',
        },
      },
      {
        if: {
          properties: {
            type: { const: 'list' },
          },
        },
        then: {
          $ref: '#/definitions/listField',
        },
      },
    ],
  },
}
