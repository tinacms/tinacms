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
import { name } from './properties'
import { findDuplicates } from '../util'
import { TinaFieldZod } from './fields'
import { tinaConfigZod } from './tinaCloudSchemaConfig'
const FORMATS = ['json', 'md', 'markdown', 'mdx'] as const

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
        message: `Fields must have a unique name, duplicate field names: ${dups}`,
      })
    }
  })

const TinaCloudCollectionBase = z.object({
  label: z.string().optional(),
  name: name,
  format: z.enum(FORMATS).optional(),
})

// Zod did not handel this union very well so we will handle it ourselves
const TinaCloudCollection = TinaCloudCollectionBase.extend({
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
          message: `Templates must have a unique name, duplicate template names: ${dups}`,
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
        message: `${dups} are duplicate names in your collections. Collection names must be unique.`,
        fatal: true,
      })
    }
    val?.collections?.map((x) => {
      if (!x.format) {
        console.warn(
          `No format provided for collection ${x.name}, defaulting to .md`
        )
      }
    })
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
  })
