import { z } from 'zod';
import { isRecord } from '../../utils/is-record';

export const TINACLOUD_ASSETS_URL = 'https://assets.tinajs.io';

export const TINACLOUD_CONTENT_URL = 'https://content.tinajs.io';

export const TINACLOUD_CDN_URL = 'https://assets.tina.io';

export const TINACLOUD_IDENTITY_URL = 'https://identity.tinajs.io';

export const TINACLOUD_APP_URL = 'https://app.tina.io';

const POLL_INTERVAL_MS = 1000;

const POLL_TIMEOUT_MS = 30_000;

const INDEX_POLL_MS = 5000;

const INDEX_TIMEOUT_MS = 15 * 60 * 1000;

const MAX_UNKNOWN_INDEX_STATUSES = 6;

const HEADS_PREFIX = 'refs/heads/';

const createBranchResponseSchema = z.object({
  data: z.object({ ref: z.string().optional() }).optional(),
});

const indexStatusSchema = z.object({ status: z.string().optional() });

const requestStatusSchema = z.object({
  error: z.boolean(),
  message: z.string().optional(),
});

const branchListSchema = z.array(
  z.object({
    name: z.string(),
    protected: z.boolean().optional(),
    githubPullRequestUrl: z.string().optional(),
  })
);

export const projectSchema = z.object({
  defaultBranch: z.string().optional(),
  mediaBranch: z.string().optional(),
});

export type TinaCloudProject = z.infer<typeof projectSchema>;

export interface TinaCloudOptions {
  /** The TinaCloud project client ID. */
  clientId: string;
}

export interface TinaCloudClientOptions extends TinaCloudOptions {
  getToken: () => string | undefined | Promise<string | undefined>;
  /**
   * How the token is sent: `Authorization: Bearer` (the default, a user token)
   * or `X-API-KEY` (an API token, as TinaCloud's Public Search token is).
   */
  credential?: 'bearer' | 'api-key';
  /** How often a new branch's index status is read. */
  indexPollMs?: number;
  /** How long a new branch may take to index before `ready` rejects. */
  indexTimeoutMs?: number;
}

const bodyMessage = (body: unknown): string | undefined => {
  if (typeof body === 'string' && body) return body;
  if (isRecord(body) && typeof body.message === 'string') return body.message;
  return undefined;
};

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

  /** The message TinaCloud sent in the response body, if any. */
  get serverMessage(): string | undefined {
    return bodyMessage(this.body);
  }
}

/** TinaCloud answered that a background request failed. */
export class TinaCloudRequestFailedError extends TinaCloudError {}

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

export const createTinaCloudClient = (options: TinaCloudClientOptions) => {
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
    if (options.credential === 'api-key') {
      headers.delete('Authorization');
      headers.set('X-API-KEY', token);
    } else {
      headers.set('Authorization', `Bearer ${token}`);
    }
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

  // TinaCloud commits media writes in the background and returns a request id
  // at once; waiting means a write only resolves once it has landed, and a
  // failed commit surfaces as an error. The same contract as v3
  // `waitForRequestStatus`: `error` is absent while the request runs, then
  // `false` for success or `true` for failure.
  const waitForRequest = async (requestId: string): Promise<void> => {
    const url = `${TINACLOUD_CONTENT_URL}/request-status/${options.clientId}/${requestId}`;
    const startedAt = Date.now();
    while (true) {
      await sleep(POLL_INTERVAL_MS);
      const body = await authedFetch(url);
      const status = requestStatusSchema.safeParse(body);
      if (status.success) {
        if (!status.data.error) return;
        throw new TinaCloudRequestFailedError(
          status.data.message ?? 'TinaCloud reported that the request failed.',
          { body }
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

  let project: Promise<TinaCloudProject> | undefined;

  // Fetched once and shared. A failure clears the cache so the next call retries.
  const getProject = (): Promise<TinaCloudProject> => {
    project ??= authedFetch(
      `${TINACLOUD_IDENTITY_URL}/v2/apps/${options.clientId}`
    ).then(
      (body) => {
        const parsed = projectSchema.safeParse(body);
        if (!parsed.success) {
          throw new TinaCloudError(
            'TinaCloud returned the project in an unknown format.',
            { body }
          );
        }
        return parsed.data;
      },
      (cause: unknown) => {
        project = undefined;
        throw cause;
      }
    );
    return project;
  };

  const listBranches = async (): Promise<
    {
      name: string;
      protected: boolean | undefined;
      pullRequestUrl: string | undefined;
    }[]
  > => {
    const body = await authedFetch(
      `${TINACLOUD_CONTENT_URL}/github/${options.clientId}/list_branches`
    );
    const parsed = branchListSchema.safeParse(body);
    if (!parsed.success) {
      throw new TinaCloudError(
        'TinaCloud returned the branch list in an unknown format.',
        { body }
      );
    }
    return parsed.data.map(
      ({ name, protected: isProtected, githubPullRequestUrl }) => ({
        name,
        protected: isProtected,
        pullRequestUrl: githubPullRequestUrl || undefined,
      })
    );
  };

  const waitForIndex = async (name: string): Promise<void> => {
    const url = `${TINACLOUD_CONTENT_URL}/db/${options.clientId}/status/${name}`;
    const pollMs = options.indexPollMs ?? INDEX_POLL_MS;
    const timeoutMs = options.indexTimeoutMs ?? INDEX_TIMEOUT_MS;
    const startedAt = Date.now();
    let unknowns = 0;
    while (true) {
      let body: unknown;
      try {
        body = await authedFetch(url);
      } catch (cause) {
        if (cause instanceof TinaCloudError && cause.status === 401)
          throw cause;
        body = undefined;
      }
      const status = indexStatusSchema.safeParse(body);
      const value = status.success ? status.data.status : undefined;
      if (value === 'complete') return;
      if (value === 'failed') {
        throw new TinaCloudError(`TinaCloud failed to index branch ${name}.`, {
          body,
        });
      }
      if (value !== 'inprogress') {
        unknowns += 1;
        if (unknowns >= MAX_UNKNOWN_INDEX_STATUSES) {
          throw new TinaCloudError(
            `TinaCloud could not report the index status of branch ${name}.`,
            { body }
          );
        }
      }
      if (Date.now() - startedAt >= timeoutMs) {
        throw new TinaCloudError(
          `TinaCloud did not finish indexing branch ${name} in time.`,
          {}
        );
      }
      await sleep(pollMs);
    }
  };

  const createBranch = async ({
    name,
    from,
  }: {
    name: string;
    from: string;
  }): Promise<{ name: string; ready: Promise<void> }> => {
    const body = await authedFetch(
      `${TINACLOUD_CONTENT_URL}/github/${options.clientId}/create_branch`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseBranch: from, branchName: name }),
      }
    );
    const parsed = createBranchResponseSchema.safeParse(body);
    const ref = parsed.success ? parsed.data.data?.ref : undefined;
    const made = ref?.startsWith(HEADS_PREFIX)
      ? ref.slice(HEADS_PREFIX.length)
      : name;
    const ready = waitForIndex(made);
    ready.catch(() => {});
    return { name: made, ready };
  };

  return {
    clientId: options.clientId,
    authedFetch,
    waitForRequest,
    getProject,
    listBranches,
    createBranch,
  };
};
