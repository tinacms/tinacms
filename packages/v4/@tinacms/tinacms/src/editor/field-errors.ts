export interface FieldErrorEntry {
  type: string;
  message?: string;
  types?: Record<string, string>;
}

export const toFieldErrorEntry = (messages: string[]): FieldErrorEntry => ({
  type: 'validation',
  // The FieldError of RHF holds one `message`, which is the first error. The `types`
  // member holds the full list, and useFieldErrors returns all of them.
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
