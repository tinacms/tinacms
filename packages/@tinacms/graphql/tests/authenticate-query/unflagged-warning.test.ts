import { afterEach, expect, it, vi } from 'vitest';
import { setup } from '../util';
import config from './tina/config';

const query = `query auth($username:String!, $password:String!) {
  authenticate(sub:$username, password:$password) { id:username }
}`;
const variables = { username: 'northwind', password: 'northwind123' };

afterEach(() => {
  vi.restoreAllMocks();
});

it('tells the server log once why an unflagged authenticate returned null', async () => {
  const { get } = await setup(__dirname, config);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  await get({ query, variables, isSignIn: true });
  expect(warn).not.toHaveBeenCalled();

  await get({ query, variables });
  await get({ query, variables, ctxUser: null });

  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0][0]).toContain('regenerate the database client');
});
