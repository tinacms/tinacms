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

// react-hook-form's `errors` is a tree shaped like the form's values — an
// array item's own field nests through an index, e.g. `errors.items[0].title`.
// `set` (`editor/resolver.ts`) built that tree from an address such as
// `items.0.title`; this walks it back into that same flat address -> messages
// shape, for the flat `FieldErrors` the form-state store keeps.
export const flattenFieldErrors = (
  node: unknown,
  prefix: string,
  out: Record<string, string[]>
): void => {
  if (isFieldErrorEntry(node)) {
    const messages = fieldErrorMessages(node);
    if (messages.length > 0) out[prefix] = messages;
  }
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node)) {
      if (ENTRY_KEYS.has(key)) continue;
      flattenFieldErrors(child, prefix ? `${prefix}.${key}` : key, out);
    }
  }
};
