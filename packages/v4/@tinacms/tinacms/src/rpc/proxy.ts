// Client half of Capability RPC (ADR-007): a typed Proxy that turns
// `server.media.upload(input)` into one POST to the mounted handler. Types come from
// each server segment's exported shape via `import type` — erased at compile time, so
// no server code (or secrets) can reach the browser bundle. Browser-safe: this module
// must not import from ../server or ../rpc/handler.

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

export const createRpcClient = <TSegments>(
  config: RpcClientConfig
): RpcProxy<TSegments> => {
  const fetchImpl = config.fetch ?? fetch;
  const call = async (namespace: string, op: string, input: unknown) => {
    const token = await config.getToken?.();
    const response = await fetchImpl(`${config.url}/${namespace}/${op}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: input === undefined ? undefined : JSON.stringify(input),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const error = (payload as { error?: { code?: string; message?: string } })
        ?.error;
      throw new RpcError(
        response.status,
        error?.code ?? 'rpc-failed',
        error?.message ?? `RPC ${namespace}/${op} failed (${response.status}).`
      );
    }
    return payload;
  };

  // Two proxy levels mirror the two call levels (`server.media.upload`). Property reads
  // are cached per namespace so repeated access doesn't re-allocate.
  const namespaces = new Map<string, unknown>();
  return new Proxy(
    {},
    {
      get(_target, namespace: string) {
        let ops = namespaces.get(namespace);
        if (!ops) {
          ops = new Proxy(
            {},
            {
              get:
                (_ops, op: string) =>
                (input: unknown): Promise<unknown> =>
                  call(namespace, op, input),
            }
          );
          namespaces.set(namespace, ops);
        }
        return ops;
      },
    }
  ) as RpcProxy<TSegments>;
};
