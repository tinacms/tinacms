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

import { z } from 'zod'
import { TinaFieldInner } from '../types/SchemaTypes'
import { hasDuplicates } from '../util'

const TypeName = [
  'string',
  'boolean',
  'number',
  'datetime',
  'image',
  'object',
  'reference',
  'rich-text',
] as const

const typeTypeError = `type must be one of ${TypeName.join(', ')}`
const typeRequiredError = `type is required and must be one of ${TypeName.join(
  ', '
)}`

const TypeNameEnum = z.enum(TypeName)

const Option = z.union([
  z.string(),
  z.object({ label: z.string(), value: z.string() }),
])
const TinaField = z.object({
  type: TypeNameEnum,
  name: z.string(),
  label: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
})

const FieldWithList = TinaField.extend({ list: z.boolean().optional() })

// ==========
// Scaler fields
// ==========
const TinaScalerBase = FieldWithList.extend({
  options: z.array(Option).optional(),
})
const StringField = TinaScalerBase.extend({
  type: z.literal(TypeNameEnum.Values.string, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
})
const BooleanField = TinaScalerBase.extend({
  type: z.literal('boolean' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
})
const NumberField = TinaScalerBase.extend({
  type: z.literal('number' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
})
const ImageField = TinaScalerBase.extend({
  type: z.literal('image' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
})

const DateTimeField = TinaScalerBase.extend({
  type: z.literal('datetime' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
})

// ==========
// Non Scaler fields
// ==========
const ReferenceField = FieldWithList.extend({
  type: z.literal('reference' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
})

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore --- Not sure why this is giving a type error here
export const TinaFieldZod: z.ZodType<TinaFieldInner<false>> = z.lazy(() => {
  // needs to be redefined here to avoid circle deps
  const TemplateTemp = z
    .object({
      label: z.string(),
      name: z.string(),
      fields: z.array(TinaFieldZod),
    })
    .refine((val) => !hasDuplicates(val.fields?.map((x) => x.name)), {
      message: 'Fields must have a unique name',
    })

  const ObjectLiteral = z.literal('object' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  })
  const ObjectFieldWithFields = FieldWithList.extend({
    type: ObjectLiteral,
    fields: z.array(TinaFieldZod),
    templates: z.undefined(),
  })
  const ObjectFieldWithTemplates = FieldWithList.extend({
    type: ObjectLiteral,
    fields: z.undefined(),
    templates: z.array(TemplateTemp),
  })

  const ObjectField = ObjectFieldWithFields.or(ObjectFieldWithTemplates)

  const RichTextField = FieldWithList.extend({
    type: z.literal('rich-text' as const, {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError,
    }),
  })

  return z.union([
    StringField,
    BooleanField,
    NumberField,
    ImageField,
    DateTimeField,
    ReferenceField,
    ObjectField,
    RichTextField,
  ])
})
