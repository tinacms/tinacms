import { it, expect } from 'vitest';
import config from './tina/config';
import { setup } from '../util';

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
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authenticate).toBeNull();
});
