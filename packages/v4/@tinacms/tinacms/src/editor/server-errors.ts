import { get } from 'react-hook-form';
import type { FormId } from '../form/form-store';

// A Backend refusal is a verdict on the whole document it received, so its
// messages live together. They hold while the form's values equal the values
// the form held when the refusal arrived, and all end the first time those
// values differ (ADR-028 §5). The comparison is by value: a re-render, a focus
// or an equal rewrite ends nothing, and a value changed back does not bring
// them back.
interface Held {
  messages: Record<string, string[]>;
  snapshot: string;
}

const held = new Map<FormId, Held>();

const sortKeys = (_key: string, value: unknown): unknown => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  );
};

const fingerprint = (value: unknown): string =>
  JSON.stringify(value, sortKeys) ?? '';

/**
 * Holds the messages of a refusal and returns the ones to show. A message
 * whose field changed while the save ran judged a value the editor no longer
 * has, so it is dropped. `current` is the form's values as the answer arrives.
 */
export const holdServerErrors = (
  formId: FormId,
  errors: Record<string, string[]>,
  sent: Record<string, unknown>,
  current: Record<string, unknown>
): Record<string, string[]> => {
  const shown: Record<string, string[]> = {};
  for (const [address, messages] of Object.entries(errors)) {
    if (
      fingerprint(get(current, address)) === fingerprint(get(sent, address))
    ) {
      shown[address] = messages;
    }
  }
  if (Object.keys(shown).length === 0) held.delete(formId);
  else held.set(formId, { messages: shown, snapshot: fingerprint(current) });
  return shown;
};

/** The held messages, while `values` still equal the values of the refusal. */
export const heldServerErrors = (
  formId: FormId,
  values: Record<string, unknown>
): Record<string, string[]> => {
  const current = held.get(formId);
  return current && fingerprint(values) === current.snapshot
    ? current.messages
    : {};
};

/** Ends every held message when `values` differ. Returns the addresses that held one. */
export const endServerErrorsIfChanged = (
  formId: FormId,
  values: Record<string, unknown>
): string[] => {
  const current = held.get(formId);
  if (!current || fingerprint(values) === current.snapshot) return [];
  held.delete(formId);
  return Object.keys(current.messages);
};

export const forgetServerErrors = (formId: FormId): void => {
  held.delete(formId);
};
