import type { JsonValue } from '../../core/json';
import type { ValidatorRef } from '../../core/schema/types';

/** The names the core validator plugin registers. */
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

/**
 * The field must hold content.
 *
 * A field type answers what "empty" means through `isEmpty` on its
 * descriptor: an empty array, an empty object, `''` and `null` are all empty
 * by default; a rich-text field with one blank paragraph is empty too; a
 * checkbox is never empty, so `required` has no effect on it.
 *
 * @param message Replaces the default, `<label> is required`.
 */
export const required = (message?: string): ValidatorRef =>
  ref('required', [message]);

/**
 * A floor on the amount the field holds: a string needs `limit` characters, an
 * array `limit` items, a number is at least `limit`. A field type chooses what
 * it measures through `measure` on its descriptor.
 *
 * An empty value passes, and `required` reports it instead, so a field with
 * both rules shows one message.
 *
 * @param message Replaces the default, `<label> must be at least <limit> <unit>`.
 */
export const min = (limit: number, message?: string): ValidatorRef =>
  ref('min', [limit, message]);

/**
 * The ceiling that `min` is the floor of, measured the same way.
 *
 * @param message Replaces the default, `<label> must be at most <limit> <unit>`.
 */
export const max = (limit: number, message?: string): ValidatorRef =>
  ref('max', [limit, message]);

/**
 * The value must match this regular expression. Pass the source as a string,
 * not a `RegExp`, because the rule serialises into `tina-lock.json`. An empty
 * value passes; use `required` for that.
 *
 * @param source A `RegExp` source, such as `'^[a-z-]+$'`.
 * @param message Replaces the default, `<label> is invalid`.
 */
export const pattern = (source: string, message?: string): ValidatorRef =>
  ref('pattern', [source, message]);

/** The rules v4 supplies, for an author who prefers one namespace. */
export const v = { required, min, max, pattern };
