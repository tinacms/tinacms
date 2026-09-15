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

const matchesFactory: ValidatorFactory =
  (pattern, message = 'Invalid format') =>
  (value) =>
    typeof value === 'string' && !new RegExp(String(pattern)).test(value)
      ? String(message)
      : null;

export const validatorsPlugin = definePlugin({
  name: 'example:validators',
  provides: ['validator'],
  validators: ['matches'],
  client: async () => ({
    default: defineClientPlugin({ validators: { matches: matchesFactory } }),
  }),
});
