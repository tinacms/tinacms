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

export const IncludeField = {
  $id: '#includeField',
  label: 'Include Template',
  description:
    'Include the fields of another Front Matter Template into the current one. ',
  type: 'object',
  properties: {
    type: {
      const: 'include',
    },
    template: {
      type: 'string',
      label: 'Template',
      description: "The template you'd like to include",
    },
    ...base,
    config: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  required: baseRequired,
}
