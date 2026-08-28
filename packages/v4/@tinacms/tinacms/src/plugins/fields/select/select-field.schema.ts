import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const SELECT_FIELD_TYPE = 'select';

export interface SelectFieldOption {
  value: string;
  label?: string;
}

export interface SelectFieldSchema extends BaseFieldSchema {
  type: typeof SELECT_FIELD_TYPE;
  options: SelectFieldOption[];
}

export const select = (
  config: Omit<SelectFieldSchema, 'type'>
): SelectFieldSchema => ({ ...config, type: SELECT_FIELD_TYPE });

const labelOf = (node: SelectFieldSchema): string => node.label ?? node.name;

export const selectSchema = (node: FieldSchema): ZodType => {
  const field = node as SelectFieldSchema;
  const values = field.options.map((option) => option.value) as [
    string,
    ...string[],
  ];
  const schema = z.enum(values, {
    errorMap: (issue, ctx) => {
      if (issue.code === 'invalid_type' && issue.received === 'undefined') {
        return { message: `${labelOf(field)} is required` };
      }
      if (issue.code === 'invalid_enum_value') {
        return {
          message: `${labelOf(field)} must be one of the listed options`,
        };
      }
      return { message: ctx.defaultError };
    },
  });
  if (field.required) {
    return schema;
  }
  return z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    schema.optional()
  );
};
