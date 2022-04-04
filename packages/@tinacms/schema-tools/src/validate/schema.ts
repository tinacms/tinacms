import { z } from 'zod'
import { TinaFieldZod } from './fields'

const Template = z.object({
  label: z.string(),
  name: z.string(),
  fields: TinaFieldZod,
})

const TinaCloudCollectionBase = z.object({
  label: z.string().optional(),
  name: z.string(),
  format: z.union([
    z.literal('json'),
    z.literal('md'),
    z.literal('markdown'),
    z.literal('mdx'),
  ]),
})

const CollectionWithFields = TinaCloudCollectionBase.extend({
  fields: z.array(TinaFieldZod),
  templates: z.undefined(),
})

const CollectionsWithTemplates = TinaCloudCollectionBase.extend({
  fields: z.undefined(),
  templates: z.array(Template),
})

const TinaCloudCollection = CollectionWithFields.or(CollectionsWithTemplates)

export const TinaCloudSchemaZod = z.object({
  collections: z.array(TinaCloudCollection),
})
