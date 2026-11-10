import { invariant } from '../core/invariant';
import type { ServerRuntime } from './runtime-storage';

// This module imports no node module: a browser bundle can reach a provider's
// server segment through its lazy `server` loader (ADR-028 §4). runtime-storage
// binds the store.
let readRuntime: () => ServerRuntime | undefined = () => undefined;

export const bindServerRuntimeReader = (
  read: () => ServerRuntime | undefined
): void => {
  readRuntime = read;
};

/** The composed server runtime of the code that is running, as `use()` reads it. */
export const currentServerRuntime = (): ServerRuntime => {
  const runtime = readRuntime();
  invariant(
    runtime,
    'server-runtime-outside-op',
    'The server runtime only exists inside code the RPC handler or the CLI runs.'
  );
  return runtime;
};
