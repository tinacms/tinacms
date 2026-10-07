export const TINACLOUD_ASSETS_URL = 'https://assets.tinajs.io';

export const TINACLOUD_CONTENT_URL = 'https://content.tinajs.io';

export const TINACLOUD_CDN_URL = 'https://assets.tina.io';

const POLL_INTERVAL_MS = 1000;

const POLL_TIMEOUT_MS = 30_000;

export interface TinaCloudOptions {
  /** The TinaCloud project client ID. */
  clientId: string;
  /**
   * Returns the TinaCloud access token for the current editor. This option is
   * interim: it goes when `tinaCloud()` provides the `auth` capability.
   */
  getToken: () => string | undefined | Promise<string | undefined>;
}

/** `status` is the HTTP status, or undefined when no response applies. */
export class TinaCloudError extends Error {
  readonly status?: number;
  readonly body?: unknown;

  constructor(message: string, details: { status?: number; body?: unknown }) {
    super(message);
    this.name = 'TinaCloudError';
    this.status = details.status;
    this.body = details.body;
  }
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseBody = (text: string): unknown => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const causeMessage = (cause: unknown): string => {
  if (cause instanceof Error) {
    return cause.message;
  }
  return String(cause);
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export type TinaCloudClient = ReturnType<typeof createTinaCloudClient>;

export const createTinaCloudClient = (options: TinaCloudOptions) => {
  /** Resolves to the parsed JSON body, the raw text if it is not JSON, or null. */
  const authedFetch = async (
    url: string,
    init: RequestInit = {}
  ): Promise<unknown> => {
    const token = await options.getToken();
    if (!token) {
      throw new TinaCloudError('No TinaCloud token is available.', {
        status: 401,
      });
    }
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);
    let response: Response;
    try {
      response = await fetch(url, { ...init, headers });
    } catch (cause) {
      throw new TinaCloudError(
        `The request to TinaCloud failed: ${causeMessage(cause)}`,
        {}
      );
    }
    const body = parseBody(await response.text());
    if (!response.ok) {
      throw new TinaCloudError(`TinaCloud responded with ${response.status}.`, {
        status: response.status,
        body,
      });
    }
    return body;
  };

  // The same contract as v3 `waitForRequestStatus`: `error` is absent while
  // the request runs, then `false` for success or `true` for failure.
  const waitForRequest = async (requestId: string): Promise<void> => {
    const url = `${TINACLOUD_CONTENT_URL}/request-status/${options.clientId}/${requestId}`;
    const startedAt = Date.now();
    while (true) {
      await sleep(POLL_INTERVAL_MS);
      const status = await authedFetch(url);
      if (isRecord(status) && typeof status.error === 'boolean') {
        if (!status.error) return;
        throw new TinaCloudError(
          typeof status.message === 'string'
            ? status.message
            : 'TinaCloud reported that the request failed.',
          { body: status }
        );
      }
      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        throw new TinaCloudError(
          `TinaCloud did not finish request ${requestId} in time.`,
          {}
        );
      }
    }
  };

  return { clientId: options.clientId, authedFetch, waitForRequest };
};
