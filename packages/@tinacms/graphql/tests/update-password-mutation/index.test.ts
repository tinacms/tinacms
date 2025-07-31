import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation } from '../util';

const updatePasswordMutation = `
  mutation updatePassword($password: String!) {
    updatePassword(password: $password)
  }
`;

it('updates password successfully with valid user context', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {
      password: 'newpassword123'
    },
    ctxUser: { sub: 'northwind' }
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.updatePassword).toBe(true);
});

it('fails to update password without user context', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {
      password: 'newpassword123'
    }
  });

  expect(result.errors).toBeDefined();
  expect(result.errors?.[0].message).toBe('Not authorized');
});

it('fails to update password with empty password', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {
      password: ''
    },
    ctxUser: { sub: 'northwind' }
  });

  expect(result.errors).toBeDefined();
  expect(result.errors?.[0].message).toBe('No password provided');
});

it('fails to update password for non-existent user', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {
      password: 'newpassword123'
    },
    ctxUser: { sub: 'nonexistent' }
  });

  expect(result.errors).toBeDefined();
  expect(result.errors?.[0].message).toBe('Not authorized');
});

it('fails to update password without password parameter', async () => {
  const { query } = await setupMutation(__dirname, config);

  const result = await query({
    query: updatePasswordMutation,
    variables: {},
    ctxUser: { sub: 'northwind' }
  });

  expect(result.errors).toBeDefined();
  expect(result.errors?.[0].message).toBe('Variable "$password" of required type "String!" was not provided.');
});