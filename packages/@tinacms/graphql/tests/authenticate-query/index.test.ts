import fs from 'fs-extra';
import path from 'path';
import { beforeEach, expect, it, vi } from 'vitest';
import { checkPasswordHash } from '../../src/auth/utils';
import { setup } from '../util';
import config from './tina/config';

vi.mock('../../src/auth/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/auth/utils')>();
  return { ...actual, checkPasswordHash: vi.fn(actual.checkPasswordHash) };
});

beforeEach(() => {
  vi.mocked(checkPasswordHash).mockClear();
});

const authenticateQuery = `
  query authenticate($sub: String!, $password: String!) {
    authenticate(sub: $sub, password: $password) {
      username
      name
      email
    }
  }
`;

it('authenticates user with valid credentials', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authenticateQuery,
    variables: {
      sub: 'northwind',
      password: 'northwind123',
    },
    isSignIn: true,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authenticate).toEqual({
    username: 'northwind',
    name: 'Mr Bob Northwind',
    email: 'bob@northwind.com',
  });
});

it('returns null for invalid password', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authenticateQuery,
    variables: {
      sub: 'northwind',
      password: 'wrongpassword',
    },
    isSignIn: true,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authenticate).toBeNull();
});

it('returns null for non-existent user', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authenticateQuery,
    variables: {
      sub: 'nonexistent',
      password: 'anypassword',
    },
    isSignIn: true,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authenticate).toBeNull();
});

it('authenticates second test user with valid credentials', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authenticateQuery,
    variables: {
      sub: 'testuser',
      password: 'testpassword',
    },
    isSignIn: true,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authenticate).toEqual({
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
  });
});

it('handles empty password gracefully', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authenticateQuery,
    variables: {
      sub: 'northwind',
      password: '',
    },
    isSignIn: true,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authenticate).toBeNull();
});

it('returns only the fields sign-in needs', async () => {
  const { get } = await setup(__dirname, config);
  const fixture = JSON.parse(
    await fs.readFile(path.join(__dirname, 'content/users/index.json'), 'utf-8')
  );

  const withValue = await get({
    query: `query authenticate($sub: String!, $password: String!) { authenticate(sub: $sub, password: $password) { username password { passwordChangeRequired value } } }`,
    variables: { sub: 'northwind', password: 'northwind123' },
    isSignIn: true,
  });
  const withoutValue = await get({
    query: `query authenticate($sub: String!, $password: String!) { authenticate(sub: $sub, password: $password) { username password { passwordChangeRequired } } }`,
    variables: { sub: 'northwind', password: 'northwind123' },
    isSignIn: true,
  });

  const serialized = JSON.stringify([withValue, withoutValue]);
  for (const user of fixture.users) {
    expect(serialized).not.toContain(user.password.value);
  }
  expect(withoutValue.errors).toBeUndefined();
  expect(withoutValue.data?.authenticate).toEqual({
    username: 'northwind',
    password: { passwordChangeRequired: false },
  });
});

const generatedClientQuery = `query auth($username:String!, $password:String!) {
              authenticate(sub:$username, password:$password) {
               id:username name email _password: password { passwordChangeRequired }
              }
            }`;

it('signs in through the generated client', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: generatedClientQuery,
    variables: { username: 'northwind', password: 'northwind123' },
    isSignIn: true,
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authenticate).toEqual({
    id: 'northwind',
    name: 'Mr Bob Northwind',
    email: 'bob@northwind.com',
    _password: { passwordChangeRequired: false },
  });
});

it.each([undefined, null, {}, { sub: '' }, { sub: 'testuser' }])(
  'only answers authenticate for sign-in calls (request user %j)',
  async (ctxUser) => {
    const { get } = await setup(__dirname, config);

    const result = await get({
      query: generatedClientQuery,
      variables: { username: 'northwind', password: 'northwind123' },
      ctxUser,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.authenticate).toBeNull();
  }
);

it.each([
  { username: 'nonexistent', password: 'anypassword' },
  { username: 'northwind', password: 'wrongpassword' },
  { username: 'nohash-user', password: 'anypassword' },
])(
  'returns the same result for every failed sign-in ($username)',
  async (variables) => {
    const { get } = await setup(__dirname, config);

    const result = await get({
      query: generatedClientQuery,
      variables,
      isSignIn: true,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.authenticate).toBeNull();
  }
);

it.each([
  { username: 'nonexistent', password: 'anypassword' },
  { username: 'nohash-user', password: 'anypassword' },
  { username: 'northwind', password: 'wrongpassword' },
  { username: 'northwind', password: 'northwind123' },
])(
  'compares a password once for every sign-in ($username)',
  async (variables) => {
    const { get } = await setup(__dirname, config);
    vi.mocked(checkPasswordHash).mockClear();

    await get({ query: generatedClientQuery, variables, isSignIn: true });

    expect(checkPasswordHash).toHaveBeenCalledTimes(1);
  }
);
