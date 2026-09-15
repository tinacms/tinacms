import { type ValidatorRef, definePlugin } from '@tinacms/tinacms';
import {
  type ValidatorFactory,
  defineClientPlugin,
} from '@tinacms/tinacms/client';

// The custom validators of this project. A collection attaches one to a field
// with `validators: [matches('^[A-Z]', 'Start with a capital')]`.
export const matches = (pattern: string, message?: string): ValidatorRef => ({
  name: 'matches',
  args: message === undefined ? [pattern] : [pattern, message],
});

// This field may only be set while the sibling `other` equals `expected`.
export const requires = (
  other: string,
  expected: string | number | boolean,
  message?: string
): ValidatorRef => ({
  name: 'requires',
  args: message === undefined ? [other, expected] : [other, expected, message],
});

const matchesFactory: ValidatorFactory =
  (pattern, message = 'Invalid format') =>
  (value) =>
    typeof value === 'string' && !new RegExp(String(pattern)).test(value)
      ? String(message)
      : null;

const requiresFactory: ValidatorFactory =
  (other, expected, message) =>
  (value, { siblings }) => {
    if (!value || siblings[String(other)] === expected) return null;
    return String(message ?? `Needs ${other} to be ${expected}`);
  };

export const validatorsPlugin = definePlugin({
  name: 'example:validators',
  provides: ['validator'],
  validators: ['matches', 'requires'],
  client: async () => ({
    default: defineClientPlugin({
      validators: { matches: matchesFactory, requires: requiresFactory },
    }),
  }),
});
