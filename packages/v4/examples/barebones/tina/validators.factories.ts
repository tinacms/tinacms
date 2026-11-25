import type {
  FieldValidationContext,
  JsonValue,
  Validate,
} from '@tinacms/tinacms/client';

// A factory takes the `args` the collection wrote, then returns the rule that
// the form runs against a value.
export function matchesFactory(
  pattern: JsonValue,
  message: JsonValue = 'Invalid format'
): Validate<unknown, FieldValidationContext> {
  return function rule(value) {
    if (typeof value !== 'string') return null;
    if (new RegExp(String(pattern)).test(value)) return null;
    return String(message);
  };
}

export function differentFromFactory(
  other: JsonValue,
  message?: JsonValue
): Validate<unknown, FieldValidationContext> {
  return function rule(value, { siblings }) {
    if (!value || value !== siblings[String(other)]) return null;
    return String(message ?? `Must differ from ${other}`);
  };
}

export function requiredWhenFactory(
  other: JsonValue,
  expected: JsonValue,
  message?: JsonValue
): Validate<unknown, FieldValidationContext> {
  return function rule(value, { siblings }) {
    if (value || siblings[String(other)] !== expected) return null;
    return String(message ?? `Required when ${other} is ${expected}`);
  };
}
