import { type ValidatorRef, definePlugin } from '@tinacms/tinacms';
import {
  type FieldValidationContext,
  type JsonValue,
  type Validate,
  defineClientPlugin,
} from '@tinacms/tinacms/client';

// The custom validators of this project. A collection attaches one to a field
// with `validators: [matches('^[A-Z]', 'Start with a capital')]`.
export const matches = (pattern: string, message?: string): ValidatorRef => ({
  name: 'matches',
  args: message === undefined ? [pattern] : [pattern, message],
});

// This field must not equal the sibling `other`.
export const differentFrom = (
  other: string,
  message?: string
): ValidatorRef => ({
  name: 'differentFrom',
  args: message === undefined ? [other] : [other, message],
});

// This field must have a value while the sibling `other` equals `value`.
export const requiredWhen = (
  other: string,
  value: string,
  message?: string
): ValidatorRef => ({
  name: 'requiredWhen',
  args: message === undefined ? [other, value] : [other, value, message],
});

// A factory takes the `args` the collection wrote, then returns the rule that
// the form runs against a value.
function matchesFactory(
  pattern: JsonValue,
  message: JsonValue = 'Invalid format'
): Validate<unknown, FieldValidationContext> {
  return function rule(value) {
    if (typeof value !== 'string') return null;
    if (new RegExp(String(pattern)).test(value)) return null;
    return String(message);
  };
}

function differentFromFactory(
  other: JsonValue,
  message?: JsonValue
): Validate<unknown, FieldValidationContext> {
  return function rule(value, { siblings }) {
    if (!value || value !== siblings[String(other)]) return null;
    return String(message ?? `Must differ from ${other}`);
  };
}

function requiredWhenFactory(
  other: JsonValue,
  expected: JsonValue,
  message?: JsonValue
): Validate<unknown, FieldValidationContext> {
  return function rule(value, { siblings }) {
    if (value || siblings[String(other)] !== expected) return null;
    return String(message ?? `Required when ${other} is ${expected}`);
  };
}

export const validatorsPlugin = definePlugin({
  name: 'example:validators',
  provides: ['validator'],
  validators: ['matches', 'differentFrom', 'requiredWhen'],
  client: async () => ({
    default: defineClientPlugin({
      validators: {
        matches: matchesFactory,
        differentFrom: differentFromFactory,
        requiredWhen: requiredWhenFactory,
      },
    }),
  }),
});
