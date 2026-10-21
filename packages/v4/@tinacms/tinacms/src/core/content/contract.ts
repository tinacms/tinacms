import { hasErrorBrand } from '../error-brand';
import type { FieldAddress } from '../field/address';
import type { TinaDocument } from '../schema/types';

// `list` names the documents of a collection. It carries no content, because a
// collection of 50 documents then costs 50 bodies to open one. The open
// document comes from `get`.
export interface DocumentSummary {
  path: string;
}

export interface DocumentEntry extends DocumentSummary {
  document: TinaDocument;
}

const CONTENT_ERROR_MESSAGES = {
  unauthorized: 'Your session has ended. Sign in again.',
  forbidden: "You don't have permission to do that.",
  'not-found': 'This document no longer exists. Refresh and try again.',
  'branch-not-found': "This branch doesn't exist. Choose another branch.",
  'not-indexed': "This branch isn't ready yet. Try again in a moment.",
  validation: 'Some fields are not valid. Fix them and try again.',
  network: "Can't reach the content server. Check your connection.",
  'backend-failure': 'Something went wrong. Please try again.',
  'hook-rejected': 'A save hook rejected this save.',
  'server-route-missing':
    "This collection has server hooks, so it needs the site's server route.",
  'write-refused': 'The content server refused this save.',
} satisfies Record<string, string>;

// The refusals whose message the server writes for the editor.
export const CONTENT_REFUSALS = {
  hookRejected: 'hook-rejected',
  writeRefused: 'write-refused',
} as const;

export type ContentRefusalCode =
  (typeof CONTENT_REFUSALS)[keyof typeof CONTENT_REFUSALS];

const CONTENT_REFUSAL_CODES: readonly ContentRefusalCode[] =
  Object.values(CONTENT_REFUSALS);

export const isContentRefusalCode = (
  code: unknown
): code is ContentRefusalCode =>
  CONTENT_REFUSAL_CODES.some((refusal) => refusal === code);

export type ContentErrorCode = keyof typeof CONTENT_ERROR_MESSAGES;

export type ContentFieldErrors = Partial<Record<FieldAddress, string[]>>;

/**
 * `message` is the sentence to show the user; `detail` is the technical reason.
 * A `hook-rejected` or `write-refused` error shows its `detail`, the message
 * the server sent.
 */
export class ContentError extends Error {
  readonly code: ContentErrorCode;
  readonly detail?: string;
  readonly fieldErrors?: ContentFieldErrors;

  constructor(
    code: ContentErrorCode,
    detail?: string,
    fieldErrors?: ContentFieldErrors
  ) {
    super(
      isContentRefusalCode(code) && detail
        ? detail
        : CONTENT_ERROR_MESSAGES[code]
    );
    this.name = 'ContentError';
    this.code = code;
    this.detail = detail;
    this.fieldErrors = fieldErrors;
  }
}

/** Each operation reports a known failure as a `ContentError`. */
export interface ContentProvider {
  get(collection: string, path: string): Promise<DocumentEntry | null>;
  list(collection: string): Promise<DocumentSummary[]>;
  update(
    collection: string,
    path: string,
    value: TinaDocument
  ): Promise<DocumentEntry>;
}

export type ContentSlice = ContentProvider;

export const CONTENT_SAVE_PERMISSION = 'content:save';

export interface ContentSaveInput {
  collection: string;
  path: string;
  value: TinaDocument;
  branch?: string;
}

export interface ContentSaveResult {
  entry: DocumentEntry;
  hookWarnings: string[];
}

const INVALID_SAVE_INPUT_BRAND: unique symbol = Symbol.for(
  'tinacms.error.invalid-save-input'
);

export class InvalidSaveInputError extends Error {
  readonly [INVALID_SAVE_INPUT_BRAND] = true;

  constructor(message: string) {
    super(message);
    this.name = 'InvalidSaveInputError';
  }
}

// A write the Data Layer refuses for a reason the editor can act on. Its message
// reaches the editor.
const CONTENT_WRITE_BRAND: unique symbol = Symbol.for(
  'tinacms.error.content-write'
);

export class ContentWriteError extends Error {
  readonly [CONTENT_WRITE_BRAND] = true;

  constructor(message: string) {
    super(message);
    this.name = 'ContentWriteError';
  }
}

export const isInvalidSaveInputError = (value: unknown): value is Error =>
  hasErrorBrand(value, INVALID_SAVE_INPUT_BRAND);

export const isContentWriteError = (value: unknown): value is Error =>
  hasErrorBrand(value, CONTENT_WRITE_BRAND);

export const DEFAULT_CONTENT_URL = '/api/tina/content';
