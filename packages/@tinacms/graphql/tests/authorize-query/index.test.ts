import { it, expect } from 'vitest';
import config from './tina/config';
import fs from 'fs-extra';
import path from 'path';
import { setup } from '../util';

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
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: 'northwind' },
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toEqual({
    username: 'northwind',
    name: 'Mr Bob Northwind',
    email: 'bob@northwind.com',
  });
});

it('returns null for non-existent user', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: 'nonexistent' },
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toBeNull();
});

it('authorizes second test user with valid context user', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: 'testuser' },
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toEqual({
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
  });
});

it('returns null when no context user provided', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authorizeQuery,
    variables: {},
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toBeNull();
});

it('returns null when context user has empty sub', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: '' },
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toBeNull();
});

it('returns null when context user has null sub', async () => {
  const { get } = await setup(__dirname, config);

  const result = await get({
    query: authorizeQuery,
    variables: {},
    ctxUser: { sub: null as any },
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.authorize).toBeNull();
});

it('returns only the fields sign-in needs', async () => {
  const { get } = await setup(__dirname, config);
  const fixture = JSON.parse(
    await fs.readFile(path.join(__dirname, 'content/users/index.json'), 'utf-8')
  );

  const withValue = await get({
    query: `query { authorize { username password { passwordChangeRequired value } } }`,
    variables: {},
    ctxUser: { sub: 'northwind' },
  });
  const withoutValue = await get({
    query: `query { authorize { username password { passwordChangeRequired } } }`,
    variables: {},
    ctxUser: { sub: 'northwind' },
  });

  const serialized = JSON.stringify([withValue, withoutValue]);
  for (const user of fixture.users) {
    expect(serialized).not.toContain(user.password.value);
  }
  expect(withoutValue.errors).toBeUndefined();
  expect(withoutValue.data?.authorize).toEqual({
    username: 'northwind',
    password: { passwordChangeRequired: false },
  });
});
