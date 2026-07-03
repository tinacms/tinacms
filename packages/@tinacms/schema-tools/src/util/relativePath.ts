/** Allowlist for a relativePath segment (filename or folder name); source of truth shared with the resolver's validateRelativePath so the UI can reject invalid names inline. */
export const RELATIVE_PATH_REGEX = /^[a-zA-Z0-9\-_./]+$/;

/** Inline form-validation message for {@link RELATIVE_PATH_REGEX}. */
export const RELATIVE_PATH_ALLOWED_CHARS_MESSAGE =
  'Must contain only a-z, A-Z, 0-9, -, _, ., or /.';

/** True when `value` contains only characters allowed in a relativePath. */
export const isValidRelativePath = (value: string): boolean =>
  RELATIVE_PATH_REGEX.test(value);
