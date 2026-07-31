
export type RpcProxy<TSegments> = {
  [Namespace in keyof TSegments]: {
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

const RESERVED_PROXY_KEYS: ReadonlySet<string> = new Set([
  'then',
  'toString',
  'valueOf',
  'toJSON',
]);
const isReservedProxyKey = (
  key: string | symbol
): key is symbol | 'then' | 'toString' | 'valueOf' | 'toJSON' =>
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
  const mimeEssence = response.headers
    .get('content-type')
    ?.replace(/;.*/, '')
    .trim()
    .toLowerCase();
  if (response.ok) {
    if (mimeEssence !== 'application/json') {
      throw new RpcError(
        response.status,
        'rpc-not-json',
        `RPC ${namespace}/${opName} returned ${response.status} but not JSON.`
      );
    }
    return response.json().catch(() => {
      throw new RpcError(
        response.status,
        'rpc-not-json',
        `RPC ${namespace}/${opName} returned ${response.status} with a body that is not JSON.`
      );
    });
  }
  const payload = await response.json().catch(() => null);
  const error = (payload as { error?: { code?: string; message?: string } })
    ?.error;
  throw new RpcError(
    response.status,
    error?.code ?? 'rpc-failed',
    error?.message ?? `RPC ${namespace}/${opName} failed (${response.status}).`
  );
};
