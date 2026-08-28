import { fetchRemoteGraphqlSchema } from './fetch-remote-graphql-schema';

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
    headers: new Headers({
      'tinacms-grapqhl-version': '1.6.0',
      'tinacms-graphql-project-version': '1.6.2',
    }),
  }) as unknown as Response;

describe('fetchRemoteGraphqlSchema', () => {
  const realFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it('returns the schema and version headers on a successful response', async () => {
    const schema = { __schema: { types: [] } };
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        stubResponse({ body: { data: schema } })
      ) as unknown as typeof fetch;

    expect(await fetchRemoteGraphqlSchema({ url: 'https://x' })).toEqual({
      remoteSchema: schema,
      remoteRuntimeVersion: '1.6.0',
      remoteProjectVersion: '1.6.2',
    });
  });

  it('throws the server error message when the response contains GraphQL errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        body: {
          errors: [
            {
              message:
                'Input Object type PageBodySponsorshipTiersFilter must define one or more fields.',
            },
          ],
        },
      })
    ) as unknown as typeof fetch;

    await expect(
      fetchRemoteGraphqlSchema({ url: 'https://x' })
    ).rejects.toThrow(
      'The remote GraphQL API returned an error: Input Object type PageBodySponsorshipTiersFilter must define one or more fields.'
    );
  });

  it('includes the status code when a non-2xx response contains GraphQL errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        status: 400,
        statusText: 'Bad Request',
        body: { errors: [{ message: 'Something went wrong.' }] },
      })
    ) as unknown as typeof fetch;

    await expect(
      fetchRemoteGraphqlSchema({ url: 'https://x' })
    ).rejects.toThrow(
      'The remote GraphQL API returned an error (status code 400, Bad Request): Something went wrong.'
    );
  });

  it('returns the schema when a successful response carries both data and errors', async () => {
    const schema = { __schema: { types: [] } };
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        body: {
          data: schema,
          errors: [{ message: 'Deprecated field requested.' }],
        },
      })
    ) as unknown as typeof fetch;

    const result = await fetchRemoteGraphqlSchema({ url: 'https://x' });
    expect(result.remoteSchema).toEqual(schema);
  });

  it('throws the server error when a non-2xx response carries both data and errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        status: 500,
        statusText: 'Internal Server Error',
        body: {
          data: { __schema: { types: [] } },
          errors: [{ message: 'Something went wrong.' }],
        },
      })
    ) as unknown as typeof fetch;

    await expect(
      fetchRemoteGraphqlSchema({ url: 'https://x' })
    ).rejects.toThrow(
      'The remote GraphQL API returned an error (status code 500, Internal Server Error): Something went wrong.'
    );
  });

  it('throws with the status code on a non-2xx response without GraphQL errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        status: 502,
        statusText: 'Bad Gateway',
        body: { message: 'upstream unavailable' },
      })
    ) as unknown as typeof fetch;

    await expect(
      fetchRemoteGraphqlSchema({ url: 'https://x' })
    ).rejects.toThrow(
      'Failed to fetch the remote GraphQL schema. Server responded with status code 502, Bad Gateway.'
    );
  });

  it('resolves with no schema on a successful response without data', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(stubResponse({ body: {} })) as unknown as typeof fetch;

    const result = await fetchRemoteGraphqlSchema({ url: 'https://x' });
    expect(result.remoteSchema).toBeUndefined();
  });

  it('hints at a stale lock file when the root input types are empty', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        body: {
          errors: [
            {
              message:
                'Input Object type DocumentFilter must define one or more fields.',
            },
            {
              message:
                'Input Object type DocumentMutation must define one or more fields.',
            },
          ],
        },
      })
    ) as unknown as typeof fetch;

    await expect(
      fetchRemoteGraphqlSchema({ url: 'https://x' })
    ).rejects.toThrow(/tina\/tina-lock\.json is out of date/);
  });

  it('does not hint at a stale lock file for a per-template validation error', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        body: {
          errors: [
            {
              message:
                'Input Object type PageBodySponsorshipTiersFilter must define one or more fields.',
            },
          ],
        },
      })
    ) as unknown as typeof fetch;

    await expect(
      fetchRemoteGraphqlSchema({ url: 'https://x' })
    ).rejects.not.toThrow(/tina-lock\.json/);
  });

  it('throws with the status code when a non-2xx response body is not JSON', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        status: 502,
        statusText: 'Bad Gateway',
        unparseable: true,
      })
    ) as unknown as typeof fetch;

    await expect(
      fetchRemoteGraphqlSchema({ url: 'https://x' })
    ).rejects.toThrow(
      'Failed to fetch the remote GraphQL schema. Server responded with status code 502, Bad Gateway.'
    );
  });

  it('throws when a successful response body is not JSON', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        stubResponse({ unparseable: true })
      ) as unknown as typeof fetch;

    await expect(
      fetchRemoteGraphqlSchema({ url: 'https://x' })
    ).rejects.toThrow(
      'The remote GraphQL API returned a response that could not be parsed as JSON (status code 200, OK).'
    );
  });

  it('keeps the server error readable when entries are not GraphQL shaped', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        stubResponse({ body: { errors: ['Rate limited'] } })
      ) as unknown as typeof fetch;

    const error = await fetchRemoteGraphqlSchema({ url: 'https://x' }).catch(
      (e) => e
    );
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toContain('Rate limited');
  });

  it('falls back to the serialized entry when an error has no message', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        stubResponse({ body: { errors: [{ code: 'X' }] } })
      ) as unknown as typeof fetch;

    const error = await fetchRemoteGraphqlSchema({ url: 'https://x' }).catch(
      (e) => e
    );
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toContain('{"code":"X"}');
  });

  it('still fires the stale lock hint when other entries are malformed', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      stubResponse({
        body: {
          errors: [
            null,
            {
              message:
                'Input Object type DocumentFilter must define one or more fields.',
            },
          ],
        },
      })
    ) as unknown as typeof fetch;

    await expect(
      fetchRemoteGraphqlSchema({ url: 'https://x' })
    ).rejects.toThrow(/tina\/tina-lock\.json is out of date/);
  });
});
