// The Capability RPC error contract: every non-2xx response body is
// `{ error: { code, message } }`. The codes are the machine-readable half of that
// wire contract, shared by the server handler and the browser proxy — one definition
// so the two sides (and their tests) can never drift. Browser-safe: no server imports.

export const RPC_ERROR_CODES = {
  methodNotAllowed: 'method-not-allowed',
  notFound: 'not-found',
  unauthenticated: 'unauthenticated',
  forbidden: 'forbidden',
  invalidJson: 'invalid-json',
  opFailed: 'op-failed',
  composeFailed: 'runtime-compose-failed',
  // Proxy-side fallback when a failure response carries no parseable envelope.
  transportFailed: 'rpc-failed',
} as const;
