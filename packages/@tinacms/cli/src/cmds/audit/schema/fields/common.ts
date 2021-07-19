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

const label = {
  type: 'string',
  label: 'Label',
  description: 'The human-friendly label shown above the input field.',
}
const name = {
  type: 'string',
  label: 'Name',
  description: 'The key used in your front matter.',
}
const description = {
  type: 'string',
  label: 'Description',
  description: 'Help text that appears above the field.',
}
const hidden = {
  type: 'boolean',
  label: 'Hidden',
  description:
    'Hide this field from the form. Used to create content with hidden default values.',
}
const showOnly = {
  type: 'object',
  label: 'Show Only',
  description:
    'This field will only be shown if the following field equals the following value. Only works with sibling select and toggle fields.',
  properties: {
    field: {
      type: 'string',
    },
    value: {
      type: 'boolean',
    },
  },
  required: ['field', 'value'],
}

export const base = {
  label,
  name,
  description,
  hidden,
  showOnly,
}
export const baseRequired = ['label', 'name', 'type']
