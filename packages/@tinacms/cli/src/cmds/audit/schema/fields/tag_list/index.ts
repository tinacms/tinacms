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

export const TagField = {
  $id: '#tagField',
  label: 'Tags Field',
  description:
    'A list of strings to make multiple selections displayed inline. Good for page categories, page tags etc.',
  type: 'object',
  properties: {
    type: {
      const: 'tag_list',
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
        required: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  required: baseRequired,
}
