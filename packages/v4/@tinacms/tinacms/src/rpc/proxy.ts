// Client half of Capability RPC (ADR-007): a typed Proxy that turns
// `server.media.upload(input)` into one POST. Types cross via `import type` (erased at
// compile time — no server code or secrets reach the browser). Browser-safe: must not
// import from ../server or ./handler.

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

// Two proxy levels mirror the two call levels. No caching: every access exists to make
// a network call, and nothing can rely on property identity anyway.
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

// Get traps see every property read, not just op calls: symbols (inspection probes)
// and `then` (await's thenable check) must read as absent, or `await client.media`
// hangs and inspection fires bogus POSTs.
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
    error?.code ?? 'rpc-failed',
    error?.message ?? `RPC ${namespace}/${opName} failed (${response.status}).`
  );
};
