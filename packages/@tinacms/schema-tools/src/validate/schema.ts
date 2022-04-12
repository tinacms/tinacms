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
import { hasDuplicates } from '../util'
import { TinaFieldZod } from './fields'
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
  .refine((val) => !hasDuplicates(val.fields?.map((x) => x.name)), {
    message: 'Fields must have a unique name',
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
    .refine((val) => !hasDuplicates(val?.map((x) => x.name)), {
      message: 'Fields must have a unique name',
    }),
  templates: z
    .array(Template)
    .min(1)
    .optional()
    .refine((val) => !hasDuplicates(val?.map((x) => x.name)), {
      message: 'Templates must have a unique name',
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
  })
  .refine((val) => !hasDuplicates(val.collections.map((x) => x.name)), {
    message: 'can not have two collections with the same name',
  })
