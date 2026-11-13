import { hasErrorBrand } from '../error-brand';
import type { BranchSource } from '../branch/contract';
import type { FieldAddress } from '../field/address';
import type { TinaDocument } from '../schema/types';

// `list` names the documents of a collection. It carries no content, because a
// collection of 50 documents then costs 50 bodies to open one. The open
// document comes from `get`.
export interface DocumentSummary {
  path: string;
  /** The document's name for people, such as its title. Pickers show it above the path. */
  title?: string;
  /** When the document last changed, as an ISO 8601 UTC string. */
  updatedAt?: string;
  /** Who last changed the document. */
  lastAuthor?: { name: string };
}

export interface DocumentEntry extends DocumentSummary {
  document: TinaDocument;
}

export const CONTENT_ERROR_MESSAGES = {
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
  'name-taken': 'A document or folder with that name already exists.',
  'invalid-path': 'That name is not allowed.',
  'folder-not-owned':
    'This folder holds files that this collection does not manage, so it cannot be renamed or deleted here.',
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

/**
 * A folder of a collection. `path` is relative to the collection's `path`, with
 * `/` between parts and no leading or trailing `/`. `documentCount` counts the
 * documents the collection owns under the folder, at every depth.
 */
export interface FolderSummary {
  path: string;
  name: string;
  documentCount: number;
}

export type ListSort = {
  by: 'title' | 'updatedAt';
  direction: 'asc' | 'desc';
};

export interface ListQuery {
  /** Folder path form. Omitted: every document at every depth, and no folders. */
  folder?: string;
  /** A substring of the shown name or file name. */
  filter?: string;
  sort?: ListSort;
  /** 1 to 200. Omitted: every match. */
  first?: number;
  after?: string;
}

export interface DocumentConnection {
  edges: { node: DocumentSummary; cursor: string }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  /** The matching documents of the scope, not folders. */
  totalCount: number;
  /** The same on every page of a scope. */
  folders: FolderSummary[];
}

/** A document that holds a reference to another document. */
export interface DocumentReferrer {
  collection: string;
  path: string;
  title?: string;
}

export interface RenameResult {
  entry: DocumentSummary;
  /** The paths of the documents whose references the rename rewrote. */
  referrers: string[];
}

export interface RenameFolderResult {
  folder: FolderSummary;
  moved: { from: string; to: string }[];
  referrers: string[];
}

/**
 * Each operation reports a known failure as a `ContentError`. The write
 * operations after `update` are optional: a provider without one still mounts,
 * and the UI hides the action.
 */
export interface ContentProvider {
  get(collection: string, path: string): Promise<DocumentEntry | null>;
  list(collection: string, query?: ListQuery): Promise<DocumentConnection>;
  update(
    collection: string,
    path: string,
    value: TinaDocument
  ): Promise<DocumentEntry>;
  /** Writes a new document. A path that exists is `name-taken`. */
  create?(
    collection: string,
    path: string,
    value: TinaDocument,
    template?: string
  ): Promise<DocumentEntry>;
  /** Moves one document within its folder and rewrites every reference to it. */
  rename?(collection: string, from: string, to: string): Promise<RenameResult>;
  /** Deletes one document. Its referrers stay as they are. */
  delete?(collection: string, path: string): Promise<void>;
  /** The documents, in any collection, that reference the document. */
  referrers?(collection: string, path: string): Promise<DocumentReferrer[]>;
  createFolder?(collection: string, folder: string): Promise<FolderSummary>;
  renameFolder?(
    collection: string,
    from: string,
    to: string
  ): Promise<RenameFolderResult>;
  /** Returns the paths of the documents it removed. */
  deleteFolder?(
    collection: string,
    folder: string
  ): Promise<{ deleted: string[] }>;
  /** Present when the provider reads from branches. */
  branches?: BranchSource;
  /** True when the provider reads files on this computer. */
  local?: true;
}

export type ContentSlice = ContentProvider;

export const CONTENT_SAVE_PERMISSION = 'content:save';
export const CONTENT_CREATE_PERMISSION = 'content:create';
export const CONTENT_RENAME_PERMISSION = 'content:rename';
export const CONTENT_DELETE_PERMISSION = 'content:delete';

/** The documents of a connection, in its order. */
export const nodesOf = (connection: DocumentConnection): DocumentSummary[] =>
  connection.edges.map(({ node }) => node);

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

// The failures of a provider's server write that reach the editor with their code.
const PROVIDER_REFUSAL_CODES = [
  'unauthorized',
  'forbidden',
  'not-found',
  'branch-not-found',
  'not-indexed',
  'validation',
  'network',
  'name-taken',
  'invalid-path',
  'folder-not-owned',
] as const satisfies readonly ContentErrorCode[];

export type ProviderRefusalCode = (typeof PROVIDER_REFUSAL_CODES)[number];

export const isProviderRefusalCode = (
  code: unknown
): code is ProviderRefusalCode =>
  PROVIDER_REFUSAL_CODES.some((refusal) => refusal === code);

const PROVIDER_REFUSAL_BRAND: unique symbol = Symbol.for(
  'tinacms.error.provider-refusal'
);

export class ProviderRefusalError extends Error {
  readonly [PROVIDER_REFUSAL_BRAND] = true;

  constructor(
    readonly code: ProviderRefusalCode,
    message: string
  ) {
    super(message);
    this.name = 'ProviderRefusalError';
  }
}

export const isProviderRefusalError = (
  value: unknown
): value is Error & { code: ProviderRefusalCode } => {
  if (hasErrorBrand(value, PROVIDER_REFUSAL_BRAND)) {
    return 'code' in value && isProviderRefusalCode(value.code);
  }
  return false;
};

export const DEFAULT_CONTENT_URL = '/api/tina/content';
