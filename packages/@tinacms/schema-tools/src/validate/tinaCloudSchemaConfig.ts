/**

*/

import { Config } from '../types/index';

import z from 'zod';
const tinaConfigKey = z
  .object({
    publicFolder: z.string(),
    mediaRoot: z.string(),
    static: z.boolean().nullish(),
  })
  .strict()
  .optional();
const tinaSearchKey = z
  .object({
    indexerToken: z.string().optional(),
    stopwordLanguages: z.array(z.string()).nonempty().optional(),
    tokenSplitRegex: z.string().optional(),
    fuzzyEnabled: z.boolean().optional(),
    fuzzyOptions: z
      .object({
        maxDistance: z.number().min(0).max(10).optional(),
        minSimilarity: z.number().min(0).max(1).optional(),
        maxTermExpansions: z.number().min(1).max(100).optional(),
        useTranspositions: z.boolean().optional(),
        caseSensitive: z.boolean().optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .optional();
export const tinaConfigZod = z.object({
  client: z.object({ referenceDepth: z.number().optional() }).optional(),
  media: z
    .object({
      tina: tinaConfigKey,
      loadCustomStore: z.function().optional(),
    })
    .optional(),
  search: z
    .object({
      tina: tinaSearchKey,
      searchClient: z.any().optional(),
      indexBatchSize: z.number().gte(1).optional(),
      maxSearchIndexFieldLength: z.number().gte(1).optional(),
    })
    .optional(),
  ui: z
    .object({
      previewUrl: z.function().optional(),
      optOutOfUpdateCheck: z.boolean().optional(),
      regexValidation: z
        .object({
          folderNameRegex: z
            .string()
            .refine(
              (val) => {
                try {
                  new RegExp(val);
                  return true;
                } catch (error) {
                  return false;
                }
              },
              { message: 'folderNameRegex is not a valid regex pattern' }
            )
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export const validateTinaCloudSchemaConfig = (config: unknown): Config => {
  const newConfig = tinaConfigZod.parse(config) as Config;
  return newConfig;
};
