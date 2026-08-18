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

/**
 * The forms the field reads and writes: a date, or a date and time with an
 * optional zone. `Date.parse` takes more shapes than this, and the input cannot
 * show them.
 */
const ISO_8601 =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

export const datetimeSchema = (node: FieldSchema): ZodType => {
  const field = node as DatetimeFieldSchema;
  const schema = z
    .string({
      required_error: `${labelOf(field)} is required`,
      invalid_type_error: `${labelOf(field)} must be a date string`,
    })
    .refine(
      (value) => ISO_8601.test(value) && !Number.isNaN(Date.parse(value)),
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
