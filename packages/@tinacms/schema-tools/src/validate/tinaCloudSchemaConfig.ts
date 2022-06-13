import { TinaCloudSchemaConfig } from '../types'

import z from 'zod'
const tinaConfigKey = z
  .object({
    publicFolder: z.string(),
    syncFolder: z.string(),
  })
  .strict()
  .optional()
export const tinaConfigZod = z.object({
  media: z
    .object({
      tina: tinaConfigKey,
    })
    .optional(),
})

export const validateTinaCloudSchemaConfig = (
  config: unknown
): TinaCloudSchemaConfig => {
  const newConfig = tinaConfigZod.parse(config) as TinaCloudSchemaConfig
  return newConfig
}
