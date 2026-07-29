import { type ZodType, z } from 'zod';
import type { BaseFieldSchema, FieldSchema } from '../../../core/schema/types';

export const DATETIME_FIELD_TYPE = 'datetime';

export interface DatetimeFieldSchema extends BaseFieldSchema {
  type: typeof DATETIME_FIELD_TYPE;
}

export const datetime = (
  config: Omit<DatetimeFieldSchema, 'type'>
): DatetimeFieldSchema => ({ ...config, type: DATETIME_FIELD_TYPE });

const labelOf = (field: DatetimeFieldSchema): string =>
  field.label ?? field.name;

// The value is an ISO-shaped string, and the field does no zone math anywhere. A YAML
// frontmatter date arrives as a Date, because js-yaml parses an unquoted date, so the
// preprocess folds that case back to the string form before the checks.
export const datetimeSchema = (node: FieldSchema): ZodType => {
  const field = node as DatetimeFieldSchema;
  const schema = z
    .string({
      required_error: `${labelOf(field)} is required`,
      invalid_type_error: `${labelOf(field)} must be a date string`,
    })
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      `${labelOf(field)} must be a valid date`
    );
  const toDateString = (value: unknown): unknown => {
    if (value instanceof Date) return value.toISOString();
    return value === '' || value == null ? undefined : value;
  };
  if (field.required) {
    return z.preprocess(toDateString, schema);
  }
  return z.preprocess(toDateString, schema.optional());
};
