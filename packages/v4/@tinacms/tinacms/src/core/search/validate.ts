import { isRecord } from '../../utils/is-record';
import { type SearchQuery, type SearchRef, SearchError } from './contract';

export const MAX_QUERY_LENGTH = 256;
export const MAX_LIMIT = 100;
export const MAX_FILTERS = 10;

export interface ValidSearchRequest {
  query: string;
  options: SearchQuery;
}

const invalid = (detail: string): never => {
  throw new SearchError('invalid-query', detail);
};

const isScalar = (value: unknown): value is string | number | boolean =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean';

const parseCursor = (cursor: string): SearchRef => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(cursor);
  } catch {
    return invalid('The cursor is not JSON.');
  }
  if (
    !isRecord(parsed) ||
    typeof parsed.collection !== 'string' ||
    typeof parsed.path !== 'string'
  ) {
    return invalid('The cursor must be a { collection, path } reference.');
  }
  return { collection: parsed.collection, path: parsed.path };
};

/**
 * Checks a search request before a provider sees it. It runs in the client
 * and again in the server op, so a raw POST meets the same limits.
 */
export const validateSearchRequest = (
  input: unknown,
  searchable: readonly string[] | undefined
): ValidSearchRequest => {
  if (!isRecord(input)) return invalid('The request must be an object.');
  const { query, options } = input;
  if (typeof query !== 'string') return invalid('`query` must be a string.');
  const text = query.trim();
  if (text.length === 0) return invalid('`query` is empty.');
  if (text.length > MAX_QUERY_LENGTH) {
    return invalid(`\`query\` is longer than ${MAX_QUERY_LENGTH} characters.`);
  }
  if (!isRecord(options)) return invalid('`options` must be an object.');
  const { limit, collections, filters, cursor } = options;
  if (
    typeof limit !== 'number' ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    return invalid(`\`limit\` must be an integer from 1 to ${MAX_LIMIT}.`);
  }
  const valid: SearchQuery = { limit };
  const isSearchable = (collection: string): boolean =>
    searchable === undefined || searchable.includes(collection);

  if (collections !== undefined) {
    if (
      !Array.isArray(collections) ||
      collections.length === 0 ||
      !collections.every((name): name is string => typeof name === 'string')
    ) {
      return invalid('`collections` must be a non-empty list of names.');
    }
    const unknown = collections.find((name) => !isSearchable(name));
    if (unknown !== undefined) {
      return invalid(`Collection "${unknown}" is not searchable.`);
    }
    valid.collections = collections;
  }
  if (filters !== undefined) {
    if (!isRecord(filters)) return invalid('`filters` must be an object.');
    const entries = Object.entries(filters);
    if (entries.length > MAX_FILTERS) {
      return invalid(`\`filters\` has more than ${MAX_FILTERS} keys.`);
    }
    for (const [key, value] of entries) {
      if (!isScalar(value)) {
        return invalid(`Filter "${key}" must be a string, number or boolean.`);
      }
    }
    // fromEntries defines each key as an own property; `checked[key] = value`
    // would run the `__proto__` setter and drop that key.
    valid.filters = Object.fromEntries(
      entries.filter((entry): entry is [string, string | number | boolean] =>
        isScalar(entry[1])
      )
    );
  }
  if (cursor !== undefined) {
    if (typeof cursor !== 'string')
      return invalid('`cursor` must be a string.');
    const ref = parseCursor(cursor);
    if (!isSearchable(ref.collection)) {
      return invalid(`Collection "${ref.collection}" is not searchable.`);
    }
    valid.cursor = cursor;
  }
  return { query: text, options: valid };
};
