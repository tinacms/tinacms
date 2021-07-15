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

export const DateField = {
  $id: '#dateField',
  label: 'Date Field',
  description:
    'A date and time picker. Good for date values such as page created, page published etc.',
  type: 'object',
  properties: {
    type: {
      const: 'datetime',
    },
    ...base,
    default: {
      type: 'string',
      // removeIfFails: true,
      anyOf: [
        {
          type: 'string',
          const: 'now',
        },
        {
          type: 'string',
          format: 'date-time',
        },
      ],
    },
    config: {
      type: 'object',
      properties: {
        required: { type: 'boolean' },
        date_format: { type: 'string' },
        time_format: { type: 'string' },
        export_format: { type: 'string' },
        display_utc: { type: 'boolean' },
      },
      additionalProperties: false,
    },
  },
  required: [...baseRequired],
  additionalProperties: false,
}
