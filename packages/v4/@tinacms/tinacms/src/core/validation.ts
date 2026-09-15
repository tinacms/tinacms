import type {
  FieldDescriptor,
  FieldValidationContext,
  PluginValidationContext,
  ValidationScope,
} from './field/contract';
import type { FieldRegistry } from './field/registry';
import { invariant } from './invariant';
import type { FieldSchema } from './schema/types';

export interface ValidateFieldOptions extends ValidationScope {
  address?: string;
}

const flattenRuleReturnMessage = (
  result: string | string[] | null
): string[] => {
  if (result === null) return [];
  return Array.isArray(result) ? result : [result];
};

export const validateField = (
  node: FieldSchema,
  descriptor: FieldDescriptor | undefined,
  value: unknown,
  options: ValidateFieldOptions = {}
): string[] => {
  const errors: string[] = [];
  const schema = descriptor?.schema?.(node);
  if (schema) {
    const result = schema.safeParse(value);
    if (!result.success) {
      errors.push(...result.error.issues.map((issue) => issue.message));
    }
  }
  const context: PluginValidationContext = {
    node,
    address: options.address ?? node.name,
  };
  if (descriptor?.validate) {
    errors.push(
      ...flattenRuleReturnMessage(descriptor.validate(value, context))
    );
  }
  const fieldContext: FieldValidationContext = {
    ...context,
    siblings: options.siblings ?? {},
    values: options.values ?? {},
  };
  for (const ref of node.validators ?? []) {
    const factory = options.validators?.get(ref.name);
    invariant(
      factory,
      'validator-unknown',
      `Field "${context.address}" lists the validator "${ref.name}", but no plugin registers it.`
    );
    const validate = factory(...(ref.args ?? []));
    errors.push(...flattenRuleReturnMessage(validate(value, fieldContext)));
  }
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
  registry: FieldRegistry,
  scope: ValidationScope = {}
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};
  const messages = validateField(node, descriptor, value, {
    ...scope,
    address,
  });
  if (messages.length > 0) errors[address] = messages;
  const childErrors = descriptor?.validateChildren?.(
    value,
    node,
    address,
    registry,
    scope
  );
  for (const [childAddress, childMessages] of Object.entries(
    childErrors ?? {}
  )) {
    if (childMessages.length > 0) errors[childAddress] = childMessages;
  }
  return errors;
};
