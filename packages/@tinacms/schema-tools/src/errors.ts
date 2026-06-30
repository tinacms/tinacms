/**
 * Shared error identifiers for TinaCMS.
 *
 * Do NOT detect which error occurred by matching raw message prose
 * (e.g. `error.message.includes('already exists')`) — that coupling breaks
 * the moment a message is reworded. In-repo producers build their messages
 * from these fragments; consumers match against the same constant.
 *
 * See https://github.com/tinacms/tinacms/issues/6777
 */

/* --- In-repo producer/consumer pairs (fully enforced) --- */

/** Path-collision fragment thrown by the @tinacms/graphql resolver. */
export const ERR_ALREADY_EXISTS = 'already exists';

/**
 * Filesystem path-traversal prefix (CWE-22). Thrown by the @tinacms/graphql
 * bridges and the @tinacms/cli path guard. The full emitted message MUST keep
 * this exact prefix — see security tests. Do not reword.
 */
export const ERR_PATH_TRAVERSAL = 'Path traversal detected';

/** AsyncPoller lifecycle signals (tinacms internalClient). */
export const ASYNC_POLLER_ERROR = {
  CANCELLED: 'AsyncPoller: cancelled',
  TIMEOUT: 'AsyncPoller: reached timeout',
} as const;

export type AsyncPollerError =
  (typeof ASYNC_POLLER_ERROR)[keyof typeof ASYNC_POLLER_ERROR];

/* --- External server contracts (NOT enforceable from this repo) ---
 * These document strings owned by another service. The producer lives
 * outside this repo, so the value must be kept in sync by hand. */

/** TinaCloud: a document still has inbound references on delete/rename. */
export const ERR_HAS_REFERENCES = 'has references';

/** TinaCloud: the branch schema has not finished indexing. */
export const ERR_NOT_INDEXED = 'has not been indexed by TinaCloud';

/** TinaCloud: branch-name conflict (editorial workflow fallback path). */
export const ERR_CONFLICT = 'conflict';
