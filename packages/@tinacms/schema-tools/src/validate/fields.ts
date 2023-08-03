/**

*/

import { z } from 'zod'
import type { TinaField as TinaFieldType } from '../types/index'
import { findDuplicates } from '../util'
import { name } from './properties'

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

const Option = z.union(
  [
    z.string(),
    z.object({ label: z.string(), value: z.string() }),
    z.object({ icon: z.any(), value: z.string() }),
  ],
  {
    errorMap: () => {
      return {
        message:
          'Invalid option array. Must be a string[] or {label: string, value: string}[] or {icon: React.ComponentType<any>, value: string}[]',
      }
    },
  }
)
const TinaField = z.object({
  name,
  label: z.string().or(z.boolean()).optional(),
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore --- Not sure why this is giving a type error here
export const TinaFieldZod: z.ZodType<TinaFieldType> = z.lazy(() => {
  // needs to be redefined here to avoid circle deps
  const TemplateTemp = z
    .object({
      label: z.string().optional(),
      name,
      fields: z.array(TinaFieldZod),
      match: z
        .object({
          start: z.string(),
          end: z.string(),
          name: z.string().optional(),
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
