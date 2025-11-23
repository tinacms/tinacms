import { z } from 'zod';
import { name } from './properties';
import { findDuplicates } from '../util';
import { TinaFieldZod } from './fields';
import { tinaConfigZod } from './tinaCloudSchemaConfig';
import {
  duplicateCollectionErrorMessage,
  duplicateFieldErrorMessage,
} from './util';
import { CONTENT_FORMATS } from '../types/index';

const Template = z
  .object({
    label: z.string({
      invalid_type_error:
        'Invalid data type for property `label`. Must be of type `string`',
      required_error: 'Missing `label` property. Property `label` is required.',
    }),
    name: name,
    fields: z.array(TinaFieldZod),
  })
  .superRefine((val, ctx) => {
    const dups = findDuplicates(val.fields?.map((x) => x.name));
    if (dups) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: duplicateFieldErrorMessage(dups),
      });
    }
  });

export const CollectionBaseSchema = z.object({
  label: z.string().optional(),
  name: name.superRefine((val, ctx) => {
    if (val === 'relativePath') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Invalid `name` property. `name` cannot be 'relativePath' as it is a reserved field name.",
      });
    }
  }),
  path: z
    .string()
    .transform((val) => val.replace(/^\/|\/$/g, ''))
    .superRefine((val, ctx) => {
      if (val === '.') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Invalid `path` property. `path` cannot be '.'. Please use '/' or '' instead.",
        });
      }
    }),
  format: z.enum(CONTENT_FORMATS).optional(),
  isAuthCollection: z.boolean().optional(),
  isDetached: z.boolean().optional(),
});

// Zod did not handel this union very well so we will handle it ourselves
const TinaCloudCollection = CollectionBaseSchema.extend({
  fields: z
    .array(TinaFieldZod)
    .min(1, 'Property `fields` cannot be empty.')
    .optional()
    .superRefine((val, ctx) => {
      const dups = findDuplicates(val?.map((x) => x.name));
      if (dups) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: duplicateFieldErrorMessage(dups),
        });
      }
    })
    .superRefine((val, ctx) => {
      const arr = val?.filter((x) => x.type === 'string' && x.isTitle) || [];
      if (arr.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The following fields have the property \`isTitle\`: [${arr
            .map((field) => field.name)
            .join(', ')}]. Only one can contain the property \`isTitle\`.`,
        });
      }
    })
    .superRefine((val, ctx) => {
      const arr = val?.filter((x) => x.uid) || [];
      if (arr.length > 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The following fields have the property \`uid\`: [${arr
            .map((field) => field.name)
            .join(', ')}]. Only one can contain the property \`uid\`.`,
        });
      }
    })
    .superRefine((val, ctx) => {
      const arr = val?.filter((x) => x.type === 'password') || [];
      if (arr.length > 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `The following fields have \`type: password\`: [${arr
            .map((field) => field.name)
            .join(', ')}]. Only one can be of \`type: password\`.`,
        });
      }
    }),
  templates: z
    .array(Template)
    .min(1, 'Property `templates` cannot be empty.')
    .optional()
    .superRefine((val, ctx) => {
      const dups = findDuplicates(val?.map((x) => x.name));
      if (dups) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: duplicateFieldErrorMessage(dups),
        });
      }
    }),
}).superRefine((val, ctx) => {
  // Must have at least one of these fields.
  if (!val?.templates && !val?.fields) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Fields of `type: object` must have either `templates` or `fields` property.',
    });
    return false;
  }

  // Cannot have both of these fields.
  if (val?.templates && val?.fields) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Fields of `type: object` must have either `templates` or `fields` property, not both.',
    });
    return false;
  }
});

export const TinaCloudSchemaZod = z
  .object({
    collections: z.array(TinaCloudCollection),
    config: tinaConfigZod.optional(),
  })
  .superRefine((val, ctx) => {
    const dups = findDuplicates(val.collections?.map((x) => x.name));
    if (dups) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: duplicateCollectionErrorMessage(dups),
        fatal: true,
      });
    }

    if (val.collections?.filter((x) => x.isAuthCollection).length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only one collection can be marked as `isAuthCollection`.',
        fatal: true,
      });
    }

    const media = val?.config?.media;
    if (media && media.tina && media.loadCustomStore) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Cannot have both `loadCustomStore` and `tina`. Must use one or the other.',
        fatal: true,
        path: ['config', 'media'],
      });
    }

    const search = val?.config?.search;
    if (search && search.tina && search.searchClient) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Cannot have both `searchClient` and `tina`. Must use one or the other.',
        fatal: true,
        path: ['config', 'search'],
      });
    }
  });
