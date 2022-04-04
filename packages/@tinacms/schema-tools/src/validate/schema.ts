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
