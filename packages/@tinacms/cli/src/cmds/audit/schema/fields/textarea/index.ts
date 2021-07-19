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

export const TextAreaField = {
  $id: '#textAreaField',
  label: 'Textarea',
  description:
    'Multi-line text input. Good for page descriptions, article summaries etc. ',
  type: 'object',
  properties: {
    type: {
      const: 'textarea',
    },
    ...base,
    default: { type: 'string' },
    config: {
      type: 'object',
      properties: {
        required: { type: 'boolean' },
        wysiwyg: {
          type: 'boolean',
          title: 'WYSIWYG Editor',
          description:
            'Whether or not the editor should present a rich-text editor',
        },
        min: { type: 'number' },
        max: { type: 'number' },
        // FIXME: this should not be present when wysiwyg is false
        schema: {
          type: 'object',
          properties: {
            format: { type: 'string', enum: ['html', 'markdown'] },
          },
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  required: baseRequired,
  additionalProperties: false,
}
