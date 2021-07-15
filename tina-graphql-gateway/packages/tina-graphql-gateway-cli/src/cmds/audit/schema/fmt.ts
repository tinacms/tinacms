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

import { AllFields } from './fields/allFields'
import { TextField } from './fields/text'
import { TextAreaField } from './fields/textarea'
import { NumberField } from './fields/number'
import { BooleanField } from './fields/boolean'
import { TagField } from './fields/tag_list'
import { DateField } from './fields/datetime'
import { SelectField } from './fields/select'
import { ListField } from './fields/list'
import { ImageField } from './fields/image'
import { ColorField } from './fields/color'
import { IncludeField } from './fields/include'
import { GalleryField } from './fields/gallery'
import { BlocksField } from './fields/blocks'
import { FieldGroupField } from './fields/field_group'
import { FieldGroupListField } from './fields/field_group_list'

export const ForestryFMTSchema = {
  title: 'Forestry FMT Schema',
  type: 'object',
  description: '',
  definitions: {
    textField: TextField,
    numberField: NumberField,
    colorField: ColorField,
    tagField: TagField,
    booleanField: BooleanField,
    textAreaField: TextAreaField,
    dateField: DateField,
    includeField: IncludeField,
    blocksField: BlocksField,
    selectField: SelectField,
    fieldGroupField: FieldGroupField,
    fieldGroupListField: FieldGroupListField,
    imageField: ImageField,
    galleryField: GalleryField,
    listField: ListField,
    allFields: AllFields,
  },
  properties: {
    label: {
      title: 'Label',
      description: 'The label used in the sidebar',
      type: 'string',
    },
    hide_body: {
      type: 'boolean',
      title: 'Hide Body?',
      description: 'Whether to show the body for the markdown file.',
    },
    display_field: {
      type: 'string',
    },
    fields: { $ref: '#/definitions/allFields' },
    pages: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['label', 'hide_body', 'fields'],
  additionalProperties: false,
}
