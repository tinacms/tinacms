/* --- In-repo producer/consumer pairs (fully enforced) --- */

/** Path-collision fragment thrown by the @tinacms/graphql resolver. */
export const ERR_ALREADY_EXISTS = 'already exists';

/** AsyncPoller lifecycle signals (tinacms internalClient). */
export const ASYNC_POLLER_ERROR = {
  CANCELLED: 'AsyncPoller: cancelled',
  TIMEOUT: 'AsyncPoller: reached timeout',
  STATUS_UNKNOWN:
    'AsyncPoller: status unknown for too long, please check indexing progress on the TinaCloud dashboard',
} as const;

export type AsyncPollerError =
  (typeof ASYNC_POLLER_ERROR)[keyof typeof ASYNC_POLLER_ERROR];

/* --- Documentation-only (producers inline the literal; not import-enforced) --- */

/**
 * Filesystem path-traversal prefix (CWE-22). The full emitted message MUST
 * keep this exact prefix — do not reword.
 *
 * The path-traversal producers (the @tinacms/graphql filesystem and isomorphic
 * bridges, and the @tinacms/cli path guard) inline this literal rather than
 * importing the constant: those modules are loaded by jest from source across a
 * package boundary, where importing the schema-tools ESM build throws "Cannot
 * use import statement outside a module". This is the canonical reference for
 * the string; keep the inlined literals byte-identical to it. The real contract
 * is enforced by the `toThrow('Path traversal detected')` assertions in the
 * bridge and CLI suites, not by this constant.
 */
export const ERR_PATH_TRAVERSAL = 'Path traversal detected';

/* --- External server contracts (NOT enforceable from this repo) ---
 * These document strings owned by another service. The producer lives
 * outside this repo, so the value must be kept in sync by hand. */

/** TinaCloud: a document still has inbound references on delete/rename. */
export const ERR_HAS_REFERENCES = 'has references';

/** TinaCloud: the branch schema has not finished indexing. */
export const ERR_NOT_INDEXED = 'has not been indexed by TinaCloud';

/** TinaCloud: a branch with the given name already exists (editorial workflow). */
export const ERR_BRANCH_EXISTS = 'already exists';

/**
 * TinaCloud: branch-name conflict (editorial workflow fallback path). Broad by
 * necessity — this matches the substring of an external server message we do
 * not own, so it cannot be narrowed without risking a missed match. The
 * structured `errorCode` switch above is the preferred path; this is the
 * no-code fallback.
 */
export const ERR_BRANCH_CONFLICT = 'conflict';
