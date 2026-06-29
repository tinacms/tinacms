export interface FieldErrorEntry {
  type: string;
  message?: string;
  types?: Record<string, string>;
}

export const toFieldErrorEntry = (messages: string[]): FieldErrorEntry => ({
  type: 'validation',
  // RHF's FieldError has a single `message` — use the first (primary) error; the
  // full list is carried in `types` and surfaced together by useFieldErrors.
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
