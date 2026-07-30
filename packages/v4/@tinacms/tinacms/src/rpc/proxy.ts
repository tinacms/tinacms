// Client half of the capability RPC (ADR-007): a typed Proxy that turns
// `server.media.upload(input)` into one POST. Runs in the browser; must not
// import from ../server or ./handler.

export type RpcProxy<TSegments> = {
  [Namespace in keyof TSegments]: {
    // Variadic inference so a zero-arg op stays callable with zero args —
    // `(input: infer I)` would infer `unknown` and demand a dummy argument.
    [Op in keyof TSegments[Namespace]]: TSegments[Namespace][Op] extends (
      ...args: infer TArgs
    ) => Promise<infer TResult>
      ? (...args: TArgs) => Promise<TResult>
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
  url: string;
  // Bearer token (ADR-023 §4). Without it, only a publicOp answers.
  getToken?: () => string | null | Promise<string | null>;
  fetch?: typeof fetch;
}

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

// Protocol keys must read as absent: `then` or `await client.media` hangs,
// and string coercion (`${client.media}`, JSON.stringify) reads toString/
// valueOf/toJSON — returning an op function there fires bogus POSTs.
const RESERVED_PROXY_KEYS: ReadonlySet<string> = new Set([
  'then',
  'toString',
  'valueOf',
  'toJSON',
]);
const isReservedProxyKey = (key: string | symbol): boolean =>
  typeof key === 'symbol' || RESERVED_PROXY_KEYS.has(key);

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
  // A 2xx that is not JSON is not a result: an SSO interstitial comes back 200,
  // and parsing it as "null" would resolve the call as an empty success.
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
