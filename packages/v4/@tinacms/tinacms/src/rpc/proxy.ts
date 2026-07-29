// The client half of the capability RPC (ADR-007). It is a typed Proxy that turns
// `server.media.upload(input)` into one POST. The types cross through an `import type`,
// which the compiler erases, so no server code and no secret reaches the browser. This
// file runs in the browser, and it must not import from ../server or from ./handler.

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
  // The base URL where the handler is mounted, for example `/api/tina`.
  url: string;
  // The session credential is a bearer token, and the transport attaches it
  // (ADR-023 §4). Without it, in local development with no auth, a request carries no
  // credential, and only a publicOp answers.
  getToken?: () => string | null | Promise<string | null>;
  fetch?: typeof fetch;
}

// The two levels of the proxy match the two levels of the call. There is no cache. Every
// read of a property leads to a network call, and no caller can depend on the identity of
// a property.
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

// A get trap sees every read of a property, and not the operation calls alone. A symbol,
// which an inspector reads, and `then`, which `await` reads, must therefore read as
// absent. Without that, `await client.media` hangs, and an inspector sends POST requests
// that no one wanted.
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
  // A 2xx that is not JSON is not a result. An SSO interstitial or a proxy's own page
  // comes back with 200, and parsing it as "null" would resolve the call as an empty
  // success — the caller then writes that absence into the UI as though it were data.
  const isJson = response.headers
    .get('content-type')
    ?.toLowerCase()
    .includes('application/json');
  if (response.ok && !isJson) {
    throw new RpcError(
      response.status,
      'rpc-not-json',
      `RPC ${namespace}/${opName} returned ${response.status} but not JSON.`
    );
  }
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
