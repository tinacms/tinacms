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

export const FieldGroupListField = {
  $id: '#fieldGroupListField',
  label: 'Field Group List',
  description:
    'A list of repeating Field Groups. Good for an object that can be reused multiple times on the same page (e.g. list of authors).',
  type: 'object',
  properties: {
    type: {
      const: 'field_group_list',
    },
    ...base,
    config: {
      type: 'object',
      properties: {
        required: { type: 'boolean' },
        use_select: { type: 'boolean' },
        labelField: { type: 'string' },
        min: { type: 'number' },
        max: { type: 'number' },
      },
      additionalProperties: false,
    },
    fields: {
      $ref: '#/definitions/allFields',
    },
  },
  required: [...baseRequired, 'fields'],
  additionalProperties: false,
}
