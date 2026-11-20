import { type ValidatorRef, definePlugin } from '@tinacms/tinacms';
import { defineClientPlugin } from '@tinacms/tinacms/client';
import {
  differentFromFactory,
  matchesFactory,
  requiredWhenFactory,
} from './validators.factories';

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

export const validatorsPlugin = definePlugin({
  name: 'example:validators',
  provides: ['validator'],
  validators: ['matches', 'differentFrom', 'requiredWhen'],
  server: () => import('./validators.server'),
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
