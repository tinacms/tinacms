import { z } from 'zod';
import type { TinaField as TinaFieldType } from '../types/index';
import { findDuplicates } from '../util';
import { name } from './properties';
import {
  duplicateFieldErrorMessage,
  duplicateTemplateErrorMessage,
} from './util';

const TypeName = [
  'string',
  'boolean',
  'number',
  'datetime',
  'image',
  'object',
  'reference',
  'rich-text',
] as const;

const formattedTypes = `  - ${TypeName.join('\n  - ')}`;
const typeTypeError = `Invalid \`type\` property. \`type\` expected to be one of the following values:\n${formattedTypes}`;
const typeRequiredError = `Missing \`type\` property. Please add a \`type\` property with one of the following:\n${formattedTypes}`;

const Option = z.union(
  [
    z.string(),
    z.object({ label: z.string(), value: z.string() }),
    z.object({ icon: z.any(), value: z.string() }),
  ],
  {
    errorMap: () => {
      return {
        message:
          'Invalid option array. Must be a string[] or {label: string, value: string}[] or {icon: React.ComponentType<any>, value: string}[]',
      };
    },
  }
);

const TinaField = z.object({
  name,
  label: z.string().or(z.boolean()).optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
});

const FieldWithList = TinaField.extend({ list: z.boolean().optional() });

// ==========
// Scaler fields
// ==========
const TinaScalerBase = FieldWithList.extend({
  options: z.array(Option).optional(),
  uid: z.boolean().optional(),
});
const StringField = TinaScalerBase.extend({
  type: z.literal('string', {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
  isTitle: z.boolean().optional(),
});
const PasswordField = TinaScalerBase.extend({
  type: z.literal('password', {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
});
const BooleanField = TinaScalerBase.extend({
  type: z.literal('boolean' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
});
const NumberField = TinaScalerBase.extend({
  type: z.literal('number' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
});
const ImageField = TinaScalerBase.extend({
  type: z.literal('image' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
});

const DateTimeField = TinaScalerBase.extend({
  type: z.literal('datetime' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
});

// ==========
// Non Scaler fields
// ==========
const ReferenceField = FieldWithList.extend({
  type: z.literal('reference' as const, {
    invalid_type_error: typeTypeError,
    required_error: typeRequiredError,
  }),
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore --- Not sure why this is giving a type error here
export const TinaFieldZod: z.ZodType<TinaFieldType> = z.lazy(() => {
  // needs to be redefined here to avoid circle deps
  const TemplateTemp = z
    .object({
      label: z.string().optional(),
      name,
      fields: z.array(TinaFieldZod),
      match: z
        .object({
          start: z.string(),
          end: z.string(),
          name: z.string().optional(),
        })
        .optional(),
    })
    .superRefine((val, ctx) => {
      const dups = findDuplicates(val?.fields.map((x) => x.name));
      if (dups) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: duplicateFieldErrorMessage(dups),
        });
      }
    });

  const ObjectField = FieldWithList.extend({
    // needs to be redefined here to avoid circle deps
    type: z.literal('object' as const, {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError,
    }),
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
      }),
    templates: z
      .array(TemplateTemp)
      .min(1, 'Property `templates` cannot be empty.')
      .optional()
      .superRefine((val, ctx) => {
        const dups = findDuplicates(val?.map((x) => x.name));
        if (dups) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: duplicateTemplateErrorMessage(dups),
          });
        }
      }),
  });

  const RichTextField = FieldWithList.extend({
    type: z.literal('rich-text' as const, {
      invalid_type_error: typeTypeError,
      required_error: typeRequiredError,
    }),
    templates: z
      .array(TemplateTemp)
      .optional()
      .superRefine((val, ctx) => {
        const dups = findDuplicates(val?.map((x) => x.name));
        if (dups) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: duplicateTemplateErrorMessage(dups),
          });
        }
      }),
  });

  return z
    .discriminatedUnion(
      'type',
      [
        StringField,
        BooleanField,
        NumberField,
        ImageField,
        DateTimeField,
        ReferenceField,
        ObjectField,
        RichTextField,
        PasswordField,
      ],
      {
        errorMap: (issue, ctx) => {
          if (issue.code === 'invalid_union_discriminator') {
            if (!ctx.data?.type) {
              return {
                message: `Missing \`type\` property in field \`${ctx.data.name}\`. Please add a \`type\` property with one of the following:\n${formattedTypes}`,
              };
            }

            return {
              message: `Invalid \`type\` property in field \`${ctx.data.name}\`. In the schema is 'type: ${ctx.data?.type}' but expected one of the following:\n${formattedTypes}`,
            };
          }
          return {
            message: issue.message || '',
          };
        },
      }
    )
    .superRefine((val, ctx) => {
      if (val.type === 'string') {
        const stringifiedField = JSON.stringify(val, null, 2);

        // refine isTitle to make sure the proper args are passed
        if (val.isTitle && val.list) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `\`list: true\` is not allowed when using \`isTitle\` for fields of \`type: string\`. Error found in field:\n${stringifiedField}`,
          });
        }

        if (val.isTitle && !val.required) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Property \`required: true\` is required when using \`isTitle\` for fields of \`type: string\`. Error found in field:\n${stringifiedField}`,
          });
        }

        if (val.uid && val.list) {
          if (val.list) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `\`list: true\` is not allowed when using \`uid\` for fields of \`type: string\`. Error found in field:\n${stringifiedField}`,
            });
          }
        }

        if (val.uid && !val.required) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Property \`required: true\` is required when using \`uid\` for fields of \`type: string\`. Error found in field:\n${stringifiedField}`,
          });
        }
      }

      // Adding the refine to ObjectField broke the discriminatedUnion so it will be added here
      if (val.type === 'object') {
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
      }

      return true;
    });
});
