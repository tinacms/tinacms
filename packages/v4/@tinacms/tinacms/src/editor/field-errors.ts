import { type FieldValues, set } from 'react-hook-form';

export interface FieldErrorEntry {
  type: string;
  message?: string;
  types?: Record<string, string>;
}

export const toFieldErrorEntry = (messages: string[]): FieldErrorEntry => ({
  type: 'validation',
  message: messages[0],
  types: Object.fromEntries(
    messages.map((message, index) => [String(index), message])
  ),
});

export const fieldErrorMessages = (
  entry: FieldErrorEntry | undefined
): string[] => {
  if (!entry) return [];
  if (entry.types) return Object.values(entry.types).filter(Boolean);
  return entry.message ? [entry.message] : [];
};

const ENTRY_KEYS = new Set(['type', 'message', 'types']);

const isFieldErrorEntry = (value: unknown): value is FieldErrorEntry =>
  typeof value === 'object' && value !== null && 'type' in value;

// Collects every message under `node`, including `node` itself. A compound
// field's own address is never an entry once it has a child error —
// react-hook-form coerces a `useFieldArray` address into a plain array, and
// drops any sibling `type`/`message` there. Walking down is how a parent
// address still shows what is wrong underneath it.
export const collectFieldErrorMessages = (node: unknown): string[] => {
  const messages = new Set(
    isFieldErrorEntry(node) ? fieldErrorMessages(node) : []
  );
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      if (ENTRY_KEYS.has(key)) continue;
      for (const message of collectFieldErrorMessages(child)) {
        messages.add(message);
      }
    }
  }
  return [...messages];
};

// Mirrors the react-hook-form error tree into `FieldErrors`, the flat
// address -> messages map the form-state store keeps. Every address gets an
// entry, not only leaf entries, since `collectFieldErrorMessages` also walks
// down from each prefix.
export const flattenFieldErrors = (
  node: unknown,
  prefix: string,
  out: Record<string, string[]>
): void => {
  if (prefix) {
    const messages = collectFieldErrorMessages(node);
    if (messages.length > 0) out[prefix] = messages;
  }
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      if (ENTRY_KEYS.has(key)) continue;
      flattenFieldErrors(child, prefix ? `${prefix}.${key}` : key, out);
    }
  }
};

// The inverse of `flattenFieldErrors`. `set` on a single-segment path is a
// plain assignment, not a merge, so a shallow address written after a deeper
// one wipes it out. Sorting shallowest first keeps a compound field's own
// message and its children's messages both in the tree.
export const nestFieldErrors = (
  flat: Record<string, string[] | undefined>
): FieldValues => {
  const tree: FieldValues = {};
  const addresses = Object.keys(flat).sort(
    (a, b) => a.split('.').length - b.split('.').length
  );
  for (const address of addresses) {
    const messages = flat[address];
    if (messages?.length) set(tree, address, toFieldErrorEntry(messages));
  }
  return tree;
};
