import { hasErrorBrand } from '../error-brand';
import type { SliceState } from '../plugin';

/** ADR-011's document pointer. `path` is what `content.get(collection, path)` takes. */
export interface SearchRef {
  collection: string;
  path: string;
}

/** One result of ADR-021's `search`. The caller re-fetches `ref` through `content`. */
export interface SearchHit {
  ref: SearchRef;
  /** Larger ranks higher. */
  score: number;
  /** Plain text, empty when the provider has none. Render it as text, never HTML. */
  snippet: string;
}

export interface SearchQuery {
  collections?: string[];
  /** Field name to value. A provider that can't apply a filter throws `unsupported`. */
  filters?: Record<string, string | number | boolean>;
  limit: number;
  /** `JSON.stringify(lastHit.ref)` of the previous page. */
  cursor?: string;
}

export type Search = (
  query: string,
  options: SearchQuery
) => Promise<SearchHit[]>;

export interface SearchProvider {
  search: Search;
}

export const isSearchProvider = (
  slice: SliceState | undefined
): slice is SliceState & SearchProvider =>
  slice !== undefined && typeof slice.search === 'function';

const SEARCH_ERROR_MESSAGES = {
  'invalid-query': "That search isn't valid. Change it and try again.",
  unsupported: "This search provider doesn't support that.",
  unavailable: "Can't reach search right now. Try again in a moment.",
  'backend-failure': 'Something went wrong. Please try again.',
} satisfies Record<string, string>;

export type SearchErrorCode = keyof typeof SEARCH_ERROR_MESSAGES;

export const isSearchErrorCode = (value: unknown): value is SearchErrorCode =>
  typeof value === 'string' && Object.hasOwn(SEARCH_ERROR_MESSAGES, value);

const SEARCH_ERROR_BRAND: unique symbol = Symbol.for('tinacms.error.search');

/** `message` is the sentence to show the user; `detail` is the technical reason. */
export class SearchError extends Error {
  readonly [SEARCH_ERROR_BRAND] = true;
  readonly code: SearchErrorCode;
  readonly detail?: string;

  constructor(code: SearchErrorCode, detail?: string) {
    super(SEARCH_ERROR_MESSAGES[code]);
    this.name = 'SearchError';
    this.code = code;
    this.detail = detail;
  }
}

/** True for a `SearchError` from this copy of the package or another. */
export const isSearchError = (value: unknown): value is SearchError =>
  hasErrorBrand(value, SEARCH_ERROR_BRAND);

export const DEFAULT_SEARCH_OP = 'search/query';
