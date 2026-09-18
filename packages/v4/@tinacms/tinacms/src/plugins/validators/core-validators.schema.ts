import type { JsonValue } from '../../core/json';
import type { ValidatorRef } from '../../core/schema/types';

export const CORE_VALIDATOR_NAMES = [
  'required',
  'min',
  'max',
  'pattern',
] as const;

/**
 * The built-in rules read their own value alone, so a field that carries only
 * these needs no refresh when a sibling changes (`core/validation.ts`).
 */
export const SELF_CONTAINED_VALIDATORS: ReadonlySet<string> = new Set(
  CORE_VALIDATOR_NAMES
);

const ref = (name: string, args: (JsonValue | undefined)[]): ValidatorRef => {
  const trimmed = [...args];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === undefined) {
    trimmed.pop();
  }
  return trimmed.length > 0 ? { name, args: trimmed as JsonValue[] } : { name };
};

/** The field must hold content. */
export const required = (message?: string): ValidatorRef =>
  ref('required', [message]);

/** A string needs `limit` characters, an array `limit` items, a number this value. */
export const min = (limit: number, message?: string): ValidatorRef =>
  ref('min', [limit, message]);

/** The ceiling that `min` is the floor of. */
export const max = (limit: number, message?: string): ValidatorRef =>
  ref('max', [limit, message]);

/** The value must match this regular expression source. */
export const pattern = (source: string, message?: string): ValidatorRef =>
  ref('pattern', [source, message]);

export const v = { required, min, max, pattern };
