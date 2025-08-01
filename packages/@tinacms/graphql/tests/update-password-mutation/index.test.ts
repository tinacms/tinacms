import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation } from '../util';
import { checkPasswordHash } from '../../src/auth/utils';

const updatePasswordMutation = `
  mutation updatePassword($password: String!) {
    updatePassword(password: $password)
  }
`;

it('updates password successfully with valid user context', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {
      password: 'newpassword123',
    },
    ctxUser: { sub: 'northwind' },
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.updatePassword).toBe(true);

  const writes = bridge.getWrites();
  expect(writes.size).toBeGreaterThan(0);

  const userWrite = bridge.getWrite('content/users/index.json');
  expect(userWrite).toBeDefined();

  const userData = JSON.parse(userWrite!);
  expect(userData.users[0].password.value).toBeDefined();
  expect(userData.users[0].password.value).not.toBe('');
  expect(userData.users[0].password.value).not.toBe('newpassword123'); // Should be hashed, not plaintext

  // Verify that the hash written will pass the required check.
  const isCorrectHash = await checkPasswordHash({
    saltedHash: userData.users[0].password.value,
    password: 'newpassword123',
  });
  expect(isCorrectHash).toBe(true);
});

it('fails to update password without user context', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {
      password: 'newpassword123',
    },
  });

  expect(result.errors).toBeDefined();
  expect(result.errors?.[0].message).toBe('Not authorized');
  expect(bridge.getWrites().size).toBe(0);
});

it('fails to update password with empty password', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {
      password: '',
    },
    ctxUser: { sub: 'northwind' },
  });

  expect(result.errors).toBeDefined();
  expect(result.errors?.[0].message).toBe('No password provided');
  expect(bridge.getWrites().size).toBe(0);
});

it('fails to update password for non-existent user', async () => {
  const { query, bridge } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {
      password: 'newpassword123',
    },
    ctxUser: { sub: 'nonexistent' },
  });

  expect(result.errors).toBeDefined();
  expect(result.errors?.[0].message).toBe('Not authorized');
  expect(bridge.getWrites().size).toBe(0);
});

it('fails to update password without password parameter', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {},
    ctxUser: { sub: 'northwind' },
  });

  expect(result.errors).toBeDefined();
  expect(result.errors?.[0].message).toBe(
    'Variable "$password" of required type "String!" was not provided.'
  );
});
