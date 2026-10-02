import type { IncomingMessage, ServerResponse } from 'http';
import type { BackendAuthProvider } from './index';
import { LocalBackendAuthProvider, TinaNodeBackend } from './index';

const customAuthProvider = (): BackendAuthProvider => ({
  isAuthorized: async () => ({ isAuthorized: true }),
});

const sendGraphQLRequest = async (
  authProvider: BackendAuthProvider,
  session?: { user?: Record<string, unknown> }
) => {
  const request = jest.fn(async () => ({ data: {} }));
  const handler = TinaNodeBackend({
    authProvider,
    databaseClient: { request },
  });
  const req = {
    url: '/api/tina/gql',
    method: 'POST',
    headers: {},
    body: { query: 'query { __typename }', variables: {} },
    ...(session ? { session } : {}),
  } as unknown as IncomingMessage;
  const res = {
    statusCode: 0,
    write: jest.fn(),
    end: jest.fn(),
  } as unknown as ServerResponse;

  await handler(req, res);

  expect(request).toHaveBeenCalledTimes(1);
  return (request.mock.calls[0] as unknown[])[0] as { user?: unknown };
};

describe('TinaNodeBackend gql route', () => {
  it('passes the session user to the database client', async () => {
    const user = { sub: 'editor-user' };
    const args = await sendGraphQLRequest(customAuthProvider(), { user });
    expect(args.user).toEqual(user);
  });

  it('passes the request user for a custom auth provider', async () => {
    const args = await sendGraphQLRequest(customAuthProvider());
    expect(args.user).toBeNull();
  });

  it('passes no user in local mode', async () => {
    const args = await sendGraphQLRequest(LocalBackendAuthProvider());
    expect(args.user).toBeUndefined();
  });
});
