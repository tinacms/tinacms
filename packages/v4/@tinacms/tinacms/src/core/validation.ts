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

  // declarative validation via the schema (i.e min, max, required)
  const schema = descriptor?.schema?.(node);
  if (schema) {
    const result = schema.safeParse(value);
    if (!result.success) {
      errors.push(...result.error.issues.map((issue) => issue.message));
    }
  }

  // imperative validation via the `validate` function on a field plugin
  const context: PluginValidationContext = {
    node,
    address: options.address ?? node.name,
  };
  if (descriptor?.validate) {
    errors.push(
      ...flattenRuleReturnMessage(descriptor.validate(value, context))
    );
  }
  // custom validation via the `validators` listed on the field
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

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasItemFields = (
  node: FieldSchema
): node is FieldSchema & { fields: FieldSchema[] } =>
  'fields' in node && Array.isArray(node.fields);

// The addresses whose rules can depend on a sibling: every field that lists
// a validator, expanded through arrays and objects against the live values.

// Returns a flat list of addresses for all fields that have validators, including nested fields. Used to combat a bug that saw React Hook Form applying errors to stale fields
export const addressesWithValidators = (
  fields: FieldSchema[],
  values: unknown,
  prefix = ''
): string[] =>
  fields.flatMap((node) => {
    const address = prefix ? `${prefix}.${node.name}` : node.name;
    const own = node.validators?.length ? [address] : [];
    if (!hasItemFields(node)) return own;
    const value = isPlainObject(values) ? values[node.name] : undefined;
    if (Array.isArray(value)) {
      return own.concat(
        value.flatMap((item, index) =>
          addressesWithValidators(node.fields, item, `${address}.${index}`)
        )
      );
    }
    return own.concat(addressesWithValidators(node.fields, value, address));
  });
