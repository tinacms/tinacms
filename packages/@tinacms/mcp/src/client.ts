export type FetchLike = typeof fetch;

export interface TinaClientOptions {
  /** GraphQL endpoint, e.g. http://localhost:4001/graphql */
  url: string;
  /** Sent as `X-API-KEY`, which is how TinaCloud authenticates content requests. */
  token?: string;
  fetch?: FetchLike;
}

export class TinaGraphQLError extends Error {
  constructor(readonly messages: string[]) {
    super(messages.join('; '));
    this.name = 'TinaGraphQLError';
  }
}

export class TinaClient {
  private readonly url: string;
  private readonly token?: string;
  private readonly fetchImpl: FetchLike;

  constructor(options: TinaClientOptions) {
    this.url = options.url;
    this.token = options.token;
    this.fetchImpl = options.fetch ?? fetch;
  }

  async request<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['X-API-KEY'] = this.token;
    }
    const res = await this.fetchImpl(this.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const text = await res.text();
    let payload: {
      data?: T;
      errors?: { message: string }[];
    };
    try {
      payload = JSON.parse(text);
    } catch {
      throw new TinaGraphQLError([
        `${this.url} returned HTTP ${res.status} with a non-JSON body`,
      ]);
    }
    if (payload.errors?.length) {
      throw new TinaGraphQLError(payload.errors.map((e) => e.message));
    }
    if (!res.ok || payload.data === undefined) {
      throw new TinaGraphQLError([`${this.url} returned HTTP ${res.status}`]);
    }
    return payload.data;
  }
}
