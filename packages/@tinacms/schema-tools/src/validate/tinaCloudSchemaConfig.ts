/**

*/

import { Config } from '../types/index'

import z from 'zod'
const tinaConfigKey = z
  .object({
    publicFolder: z.string(),
    mediaRoot: z.string(),
  })
  .strict()
  .optional()
export const tinaConfigZod = z.object({
  client: z.object({ referenceDepth: z.number().optional() }).optional(),
  media: z
    .object({
      tina: tinaConfigKey,
      loadCustomStore: z.function().optional(),
    })
    .optional(),
})

export const validateTinaCloudSchemaConfig = (config: unknown): Config => {
  const newConfig = tinaConfigZod.parse(config) as Config
  return newConfig
}
