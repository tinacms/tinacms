import type { FieldDescriptor } from './field/contract';
import type { FieldSchema } from './schema/types';

export const validateField = (
  node: FieldSchema,
  descriptor: FieldDescriptor | undefined,
  value: unknown
): string[] => {
  const errors: string[] = [];
  const schema = descriptor?.schema?.(node);
  if (schema) {
    const result = schema.safeParse(value);
    if (!result.success) {
      errors.push(...result.error.issues.map((issue) => issue.message));
    }
  }
  const custom = descriptor?.validate?.(value);
  if (custom) errors.push(custom);
  return errors;
};
