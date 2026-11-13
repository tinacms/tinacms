import { RpcError } from '../rpc/proxy';

/** A static host answers a route it lacks with 404 or 405, or with an HTML page. */
export const isMissingRouteError = (cause: unknown): boolean => {
  if (!(cause instanceof RpcError)) return false;
  return (
    cause.status === 404 ||
    cause.status === 405 ||
    cause.code === 'rpc-not-json'
  );
};
