import { z } from 'zod'
import { name } from './properties'
import { findDuplicates } from '../util'
import { TinaFieldZod } from './fields'
import { tinaConfigZod } from './tinaCloudSchemaConfig'
import {
  duplicateCollectionErrorMessage,
  duplicateFieldErrorMessage,
} from './util'
const FORMATS = [
  'json',
  'md',
  'markdown',
  'mdx',
  'toml',
  'yaml',
  'yml',
] as const

const Template = z
  .object({
    label: z.string({
      invalid_type_error: 'label must be a string',
      required_error: 'label was not provided but is required',
    }),
    name: name,
    fields: z.array(TinaFieldZod),
  })
  .superRefine((val, ctx) => {
    const dups = findDuplicates(val.fields?.map((x) => x.name))
    if (dups) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: duplicateFieldErrorMessage(dups),
      })
    }
  })

export const CollectionBaseSchema = z.object({
  label: z.string().optional(),
  name: name.superRefine((val, ctx) => {
    if (val === 'relativePath') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `name cannot be 'relativePath'. 'relativePath' is a reserved field name.`,
      })
    }
  }),
  path: z
    .string()
    .transform((val) => val.replace(/^\/|\/$/g, ''))
    .superRefine((val, ctx) => {
      if (val === '.') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `path cannot be '.'. Please use '/' or '' instead. `,
        })
      }
    }),
  format: z.enum(FORMATS).optional(),
  isAuthCollection: z.boolean().optional(),
  isDetached: z.boolean().optional(),
})

// Zod did not handel this union very well so we will handle it ourselves
const TinaCloudCollection = CollectionBaseSchema.extend({
  fields: z
    .array(TinaFieldZod)
    .min(1)
    .optional()
    .superRefine((val, ctx) => {
      const dups = findDuplicates(val?.map((x) => x.name))
      if (dups) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: duplicateFieldErrorMessage(dups),
        })
      }
    })
    .refine(
      // It is valid if it is 0 or 1
      (val) => {
        const arr = val?.filter((x) => x.type === 'string' && x.isTitle) || []
        return arr.length < 2
      },
      {
        message: 'Fields can only have one use of `isTitle`',
      }
    )
    .refine(
      // It is valid if it is 0 or 1
      (val) => {
        const arr = val?.filter((x) => x.uid) || []
        return arr.length < 2
      },
      {
        message: 'Fields can only have one use of `uid`',
      }
    )
    .refine(
      // It is valid if it is 0 or 1
      (val) => {
        const arr = val?.filter((x) => x.type === 'password') || []
        return arr.length < 2
      },
      {
        message: 'Fields can only have one use of `password` type',
      }
    ),
  templates: z
    .array(Template)
    .min(1)
    .optional()
    .superRefine((val, ctx) => {
      const dups = findDuplicates(val?.map((x) => x.name))
      if (dups) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: duplicateFieldErrorMessage(dups),
        })
      }
    }),
}).refine(
  (val) => {
    let isValid = Boolean(val?.templates) || Boolean(val?.fields)
    if (!isValid) {
      return false
    } else {
      isValid = !(val?.templates && val?.fields)
      return isValid
    }
  },
  { message: 'Must provide one of templates or fields in your collection' }
)

export const TinaCloudSchemaZod = z
  .object({
    collections: z.array(TinaCloudCollection),
    config: tinaConfigZod.optional(),
  })
  .superRefine((val, ctx) => {
    const dups = findDuplicates(val.collections?.map((x) => x.name))
    if (dups) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: duplicateCollectionErrorMessage(dups),
        fatal: true,
      })
    }

    if (val.collections?.filter((x) => x.isAuthCollection).length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Only one collection can be marked as isAuthCollection`,
        fatal: true,
      })
    }

    const media = val?.config?.media
    if (media && media.tina && media.loadCustomStore) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'can not have both loadCustomStore and tina. Must use one or the other',
        fatal: true,
        path: ['config', 'media'],
      })
    }

    const search = val?.config?.search
    if (search && search.tina && search.searchClient) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'can not have both searchClient and tina. Must use one or the other',
        fatal: true,
        path: ['config', 'search'],
      })
    }
  })
