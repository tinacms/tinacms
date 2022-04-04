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
import { hasDuplicates } from '../util'
import { TinaFieldZod } from './fields'
const FORMATS = ['json', 'md', 'markdown', 'mdx'] as const

const Template = z
  .object({
    label: z.string(),
    name: z.string(),
    fields: z.array(TinaFieldZod),
  })
  .refine((val) => !hasDuplicates(val.fields?.map((x) => x.name)), {
    message: 'Fields must have a unique name',
  })

const TinaCloudCollectionBase = z.object({
  label: z.string().optional(),
  name: z.string(),
  format: z.enum(FORMATS).optional(),
})

const CollectionWithFields = TinaCloudCollectionBase.extend({
  fields: z.array(TinaFieldZod).min(1),
  templates: z.undefined(),
}).refine((val) => !hasDuplicates(val.fields?.map((x) => x.name)), {
  message: 'Fields must have a unique name',
})

const CollectionsWithTemplates = TinaCloudCollectionBase.extend({
  fields: z.undefined(),
  templates: z.array(Template),
}).refine((val) => !hasDuplicates(val.templates?.map((x) => x.name)), {
  message: 'Templates must have a unique name',
})

const TinaCloudCollection = CollectionWithFields.or(CollectionsWithTemplates)

export const TinaCloudSchemaZod = z
  .object({
    collections: z.array(TinaCloudCollection),
  })
  .refine((val) => !hasDuplicates(val.collections.map((x) => x.name)), {
    message: 'can not have two collections with the same name',
  })
