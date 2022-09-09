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
import { findDuplicates } from '../util'

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

const nameProp = z
  .string({
    required_error: 'name must be provided',
    invalid_type_error: 'name must be a sting',
  })
  .superRefine((val, ctx) => {
    if (val.includes(' '))
      ctx.addIssue({
        message: `name "${val}" cannot contain spaces`,
        code: z.ZodIssueCode.custom,
        fatal: true,
      })
  })

const Option = z.union(
  [z.string(), z.object({ label: z.string(), value: z.string() })],
  {
    errorMap: () => {
      return {
        message:
          'Invalid option array. Must be a string[] or {label: string, value: string}[]',
      }
    },
  }
)
const TinaField = z.object({
  name: nameProp,
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
  type: z.literal('string', {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
  isTitle: z.boolean().optional(),
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
      name: nameProp,
      fields: z.array(TinaFieldZod),
      match: z
        .object({
          start: z.string(),
          end: z.string(),
        })
        .optional(),
    })
    .superRefine((val, ctx) => {
      const dups = findDuplicates(val?.fields.map((x) => x.name))
      if (dups) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Fields must have a unique name, duplicate field names: ${dups}`,
        })
      }
    })

  const ObjectField = FieldWithList.extend({
    // needs to be redefined here to avoid circle deps
    type: z.literal('object' as const, {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError,
    }),
    fields: z
      .array(TinaFieldZod)
      .min(1)
      .optional()
      .superRefine((val, ctx) => {
        const dups = findDuplicates(val?.map((x) => x.name))
        if (dups) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Fields must have a unique name, duplicate field names: ${dups}`,
          })
        }
      }),
    templates: z
      .array(TemplateTemp)
      .min(1)
      .optional()
      .superRefine((val, ctx) => {
        const dups = findDuplicates(val?.map((x) => x.name))
        if (dups) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Templates must have a unique name, duplicate template names: ${dups}`,
          })
        }
      }),
  })

  const RichTextField = FieldWithList.extend({
    type: z.literal('rich-text' as const, {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError,
    }),
    templates: z
      .array(TemplateTemp)
      .optional()
      .superRefine((val, ctx) => {
        const dups = findDuplicates(val?.map((x) => x.name))
        if (dups) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Templates must have a unique name, duplicate template names: ${dups}`,
          })
        }
      }),
  })

  return z
    .discriminatedUnion(
      'type',
      [
        StringField,
        BooleanField,
        NumberField,
        ImageField,
        DateTimeField,
        ReferenceField,
        ObjectField,
        RichTextField,
      ],
      {
        errorMap: (issue, ctx) => {
          // Add a better error message for invalid_union_discriminator
          if (issue.code === 'invalid_union_discriminator') {
            return {
              message: `Invalid \`type\` property. In the schema is 'type: ${
                ctx.data?.type
              }' and expected one of ${TypeName.join(', ')}`,
            }
          }
          return {
            message: issue.message,
          }
        },
      }
    )
    .superRefine((val, ctx) => {
      if (val.type === 'string') {
        // refine isTitle to make sure the proper args are passed
        if (val.isTitle) {
          if (val.list) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Can not have \`list: true\` when using \`isTitle\`. Error in value \n${JSON.stringify(
                val,
                null,
                2
              )}\n`,
            })
          }
          if (!val.required) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Must have { required: true } when using \`isTitle\` Error in value \n${JSON.stringify(
                val,
                null,
                2
              )}\n`,
            })
          }
        }
      }
      // Adding the refine to ObjectField broke the discriminatedUnion so it will be added here
      if (val.type === 'object') {
        // TODO: Maybe clean up this code its sorta messy
        const message =
          'Must provide one of templates or fields in your collection'
        let isValid = Boolean(val?.templates) || Boolean(val?.fields)
        if (!isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message,
          })
          return false
        } else {
          isValid = !(val?.templates && val?.fields)
          if (!isValid) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message,
            })
          }
          return isValid
        }
      }

      return true
    })
})
