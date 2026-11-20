import { get } from 'react-hook-form';
import type { FormId } from '../form/form-store';

// The messages a Backend refusal put on a form, each with the value it
// refused. The form resolver adds them back while the value at that address
// is unchanged, so a re-validation that the client rules pass (an array
// action, a sibling rule) does not drop a message the server still holds.
// A message ends when its value changes, and when the next save starts.
interface Refusal {
  messages: string[];
  value: string;
}

const refusals = new Map<FormId, Map<string, Refusal>>();

const fingerprint = (value: unknown): string => JSON.stringify(value) ?? '';

export const rememberServerErrors = (
  formId: FormId,
  errors: Record<string, string[]>,
  values: Record<string, unknown>
): void => {
  const held = new Map<string, Refusal>();
  for (const [address, messages] of Object.entries(errors)) {
    held.set(address, {
      messages,
      value: fingerprint(get(values, address)),
    });
  }
  refusals.set(formId, held);
};

export const forgetServerErrors = (formId: FormId): void => {
  refusals.delete(formId);
};

/** The remembered messages whose value is still the one the server refused. */
export const heldServerErrors = (
  formId: FormId,
  values: Record<string, unknown>
): Record<string, string[]> => {
  const held: Record<string, string[]> = {};
  for (const [address, refusal] of refusals.get(formId) ?? []) {
    if (fingerprint(get(values, address)) === refusal.value) {
      held[address] = refusal.messages;
    }
  }
  return held;
};
