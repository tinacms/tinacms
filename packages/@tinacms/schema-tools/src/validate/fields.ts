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
const typeReqiredError = `type is required and must be one of ${TypeName.join(
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
    required_error: typeReqiredError,
  }),
})
const BooleanField = TinaScalerBase.extend({
  type: z.literal('boolean' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeReqiredError,
  }),
})
const NumberField = TinaScalerBase.extend({
  type: z.literal('number' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeReqiredError,
  }),
})
const ImageField = TinaScalerBase.extend({
  type: z.literal('image' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeReqiredError,
  }),
})

const DateTimeField = TinaScalerBase.extend({
  type: z.literal('datetime' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeReqiredError,
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
    required_error: typeReqiredError,
  }),
})

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
    required_error: typeReqiredError,
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
      required_error: typeReqiredError,
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
