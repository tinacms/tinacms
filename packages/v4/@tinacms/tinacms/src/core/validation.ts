import type { FieldDescriptor } from './field/contract';
import type { FieldRegistry } from './field/registry';
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

// Recurses into a compound field's own `validateChildren`, so a nested
// compound field (an array inside an array) validates at any depth.
//
// This does not roll a child's message onto its ancestors. react-hook-form
// coerces a `useFieldArray` address into a plain array of item errors, and
// drops any sibling `type`/`message` there. `useFieldErrors`
// (`editor/hooks.ts`) rolls messages up instead, by reading the tree with
// `collectFieldErrorMessages`.
export const validateFieldTree = (
  node: FieldSchema,
  descriptor: FieldDescriptor | undefined,
  value: unknown,
  address: string,
  registry: FieldRegistry
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  const messages = validateField(node, descriptor, value);
  if (messages.length > 0) errors[address] = messages;
  const childErrors = descriptor?.validateChildren?.(
    value,
    node,
    address,
    registry
  );
  for (const [childAddress, childMessages] of Object.entries(
    childErrors ?? {}
  )) {
    if (childMessages.length > 0) errors[childAddress] = childMessages;
  }
  return errors;
};
