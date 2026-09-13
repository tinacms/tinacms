import { fetchSchemaSha } from './fetch-schema-sha';

const stubResponse = ({
  status = 200,
  statusText = 'OK',
  body,
  unparseable = false,
}: {
  status?: number;
  statusText?: string;
  body?: unknown;
  unparseable?: boolean;
}) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => {
      if (unparseable) {
        throw new SyntaxError('Unexpected token < in JSON at position 0');
      }
      return body;
    },
    headers: new Headers(),
  }) as unknown as Response;

describe('fetchSchemaSha', () => {
  const realFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('returns the parsed body and does not allow a cached response', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(stubResponse({ body: { tinaSchema: 'abc123' } }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    expect(await fetchSchemaSha({ url: 'https://x', token: 'secret' })).toEqual(
      { tinaSchema: 'abc123' }
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://x',
      expect.objectContaining({ method: 'GET', cache: 'no-cache' })
    );
  });

  it('throws the server error message when the response contains errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        body: { errors: [{ message: 'Branch not indexed.' }] },
      })
    ) as unknown as typeof fetch;

    await expect(fetchSchemaSha({ url: 'https://x' })).rejects.toThrow(
      'The remote Tina schema API returned an error: Branch not indexed.'
    );
  });

  it('includes the status code when a non-2xx response contains errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        status: 400,
        statusText: 'Bad Request',
        body: { errors: [{ message: 'Something went wrong.' }] },
      })
    ) as unknown as typeof fetch;

    await expect(fetchSchemaSha({ url: 'https://x' })).rejects.toThrow(
      'The remote Tina schema API returned an error (status code 400, Bad Request): Something went wrong.'
    );
  });

  it('surfaces the server message on a non-2xx response without errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        status: 502,
        statusText: 'Bad Gateway',
        body: { message: 'upstream unavailable' },
      })
    ) as unknown as typeof fetch;

    const error = await fetchSchemaSha({ url: 'https://x' }).catch((e) => e);
    expect(error.message).toContain(
      'Failed to fetch the remote Tina schema. Server responded with status code 502, Bad Gateway.'
    );
    expect(error.message).toContain(
      'Message from server: upstream unavailable'
    );
  });

  it('adds the credentials hint on an unauthorized response', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        status: 401,
        statusText: 'Unauthorized',
        body: {},
      })
    ) as unknown as typeof fetch;

    await expect(fetchSchemaSha({ url: 'https://x' })).rejects.toThrow(
      /client ID, URL and read only token are configured properly/
    );
  });

  it('resolves without a sha on a successful response that has none', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(stubResponse({ body: {} })) as unknown as typeof fetch;

    const result = await fetchSchemaSha({ url: 'https://x' });
    expect(result.tinaSchema).toBeUndefined();
  });

  it('throws with the status code when a non-2xx response body is not JSON', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        status: 502,
        statusText: 'Bad Gateway',
        unparseable: true,
      })
    ) as unknown as typeof fetch;

    await expect(fetchSchemaSha({ url: 'https://x' })).rejects.toThrow(
      /Failed to fetch the remote Tina schema\. Server responded with status code 502, Bad Gateway\./
    );
  });

  it('throws when a successful response body is not JSON', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        stubResponse({ unparseable: true })
      ) as unknown as typeof fetch;

    await expect(fetchSchemaSha({ url: 'https://x' })).rejects.toThrow(
      'The remote Tina schema API returned a response that could not be parsed as JSON (status code 200, OK).'
    );
  });

  it('keeps the server error readable when entries are not object shaped', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        stubResponse({ body: { errors: ['Rate limited'] } })
      ) as unknown as typeof fetch;

    const error = await fetchSchemaSha({ url: 'https://x' }).catch((e) => e);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toContain('Rate limited');
  });
});
