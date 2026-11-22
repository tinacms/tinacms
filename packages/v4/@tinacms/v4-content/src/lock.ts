import type { CollectionSchema } from './schema';

export type { CollectionSchema } from './schema';

export const LOCK_VERSION = 5;

export interface PackageVersion {
  fullVersion: string;
  major: string;
  minor: string;
  patch: string;
}

export interface TinaLock {
  version: number;
  schema: { collections: CollectionSchema[]; version: PackageVersion };
  primitives: Record<string, number>;
}

/** The text is not a `tina-lock.json` this package can read. */
export class TinaLockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TinaLockError';
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// A function declaration, so that TypeScript narrows after a call to it.
function fail(message: string): never {
  throw new TinaLockError(`tina-lock.json ${message}`);
}

const checkCollection = (collection: unknown, index: number): void => {
  if (!isRecord(collection)) {
    fail(`has a collection at ${index} that is not an object.`);
  }
  if (typeof collection.name !== 'string') {
    fail(`has a collection at ${index} with no name.`);
  }
  if (!Array.isArray(collection.fields)) {
    fail(`has a collection "${collection.name}" with no fields.`);
  }
};

/**
 * Reads the text of a `tina-lock.json`. It checks the shape that a reader of the
 * lock depends on, and throws a `TinaLockError` when that shape is wrong. It
 * does not compare `version` with `LOCK_VERSION`; the caller decides that.
 */
export const parseTinaLock = (raw: string): TinaLock => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    if (cause instanceof Error) fail(`is not JSON: ${cause.message}`);
    fail(`is not JSON: ${String(cause)}`);
  }
  if (!isRecord(parsed)) fail('is not a JSON object.');
  if (!Number.isInteger(parsed.version)) fail('has no integer `version`.');
  const { schema, primitives } = parsed;
  if (!isRecord(schema)) fail('has no `schema` object.');
  if (!Array.isArray(schema.collections)) {
    fail('has no `schema.collections` list.');
  }
  schema.collections.forEach(checkCollection);
  if (!isRecord(schema.version)) fail('has no `schema.version` object.');
  if (!isRecord(primitives)) fail('has no `primitives` object.');
  for (const [type, version] of Object.entries(primitives)) {
    if (typeof version !== 'number') {
      fail(`pins the field type "${type}" to a version that is not a number.`);
    }
  }
  return parsed as unknown as TinaLock;
};
