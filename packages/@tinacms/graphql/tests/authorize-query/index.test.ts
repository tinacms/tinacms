import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation } from '../util';

const authorizeQuery = `
  query authorize {
    authorize {
      username
      name
      email
    }
  }
`;

it('authorizes user with valid context user', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: 'northwind' }
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toEqual({
    username: 'northwind',
    name: 'Mr Bob Northwind',
    email: 'bob@northwind.com'
  });
});

it('returns null for non-existent user', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: 'nonexistent' }
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toBeNull();
});

it('authorizes second test user with valid context user', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: 'testuser' }
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toEqual({
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com'
  });
});

it('returns null when no context user provided', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: authorizeQuery,
    variables: {}
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toBeNull();
});

it('returns null when context user has empty sub', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: '' }
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toBeNull();
});

it('returns null when context user has null sub', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: null as any }
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toBeNull();
});