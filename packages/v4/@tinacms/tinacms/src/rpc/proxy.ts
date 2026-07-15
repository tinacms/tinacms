// Client half of Capability RPC (ADR-007): a typed Proxy that turns
// `server.media.upload(input)` into one POST to the mounted handler. Types come from
// each server segment's exported shape via `import type` — erased at compile time, so
// no server code (or secrets) can reach the browser bundle. Browser-safe: this module
// must not import from ../server or ../rpc/handler.

import { RPC_ERROR_CODES } from './codes';

// Maps a record of server segments to their client call signatures: each op keeps its
// input/output types but loses everything else (there is nothing else — ops are
// `(input) => Promise<result>` by contract).
export type RpcProxy<TSegments> = {
  [Namespace in keyof TSegments]: {
    [Op in keyof TSegments[Namespace]]: TSegments[Namespace][Op] extends (
      input: infer TInput
    ) => Promise<infer TResult>
      ? (input: TInput) => Promise<TResult>
      : never;
  };
};

export class RpcError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'RpcError';
  }
}

export interface RpcClientConfig {
  // Base URL the handler is mounted at, e.g. `/api/tina`.
  url: string;
  // The session credential is a bearer token attached by the transport (ADR-023 §4).
  // Absent (local dev, no auth), requests go out bare and publicOp is all that answers.
  getToken?: () => string | null | Promise<string | null>;
  fetch?: typeof fetch;
}

// Two proxy levels mirror the two call levels (`server.media.upload`). No caching:
// every access exists to make a network call, and op reads allocate a closure per
// read regardless, so nothing can rely on property identity anyway.
export const createRpcClient = <TSegments>(
  config: RpcClientConfig
): RpcProxy<TSegments> =>
  new Proxy(
    {},
    {
      get: (_target, namespace) =>
        isReservedProxyKey(namespace)
          ? undefined
          : createNamespaceProxy(config, namespace),
    }
  ) as RpcProxy<TSegments>;

// A Proxy get trap sees every property read, not just op calls: symbols (console and
// runtime inspection probes) and `then` (the thenable check `await` performs on any
// object). Those must read as absent — answering them would hang `await client.media`
// and fire bogus POSTs to /then.
const isReservedProxyKey = (key: string | symbol): key is symbol | 'then' =>
  typeof key === 'symbol' || key === 'then';

const createNamespaceProxy = (config: RpcClientConfig, namespace: string) =>
  new Proxy(
    {},
    {
      get: (_ops, opName) =>
        isReservedProxyKey(opName)
          ? undefined
          : (input: unknown): Promise<unknown> =>
              postOp(config, namespace, opName, input),
    }
  );

const postOp = async (
  config: RpcClientConfig,
  namespace: string,
  opName: string,
  input: unknown
): Promise<unknown> => {
  const fetchImpl = config.fetch ?? fetch;
  const token = await config.getToken?.();
  const response = await fetchImpl(`${config.url}/${namespace}/${opName}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: input === undefined ? undefined : JSON.stringify(input),
  });
  return unwrapRpcResponse(response, namespace, opName);
};

const unwrapRpcResponse = async (
  response: Response,
  namespace: string,
  opName: string
): Promise<unknown> => {
  const payload = await response.json().catch(() => null);
  if (response.ok) return payload;
  const error = (payload as { error?: { code?: string; message?: string } })
    ?.error;
  throw new RpcError(
    response.status,
    error?.code ?? RPC_ERROR_CODES.transportFailed,
    error?.message ?? `RPC ${namespace}/${opName} failed (${response.status}).`
  );
};
