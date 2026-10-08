import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { type AuthUser, toUserId } from '../core/auth/contract';
import { createFieldRegistry } from '../core/field/registry';
import { createFormHookRegistry } from '../core/form/hooks';
import {
  type PluginManifest,
  definePlugin,
  resolveClientSegments,
} from '../core/plugin';
import { createScreenRegistry } from '../core/screen/registry';
import { createGlobalNav } from '../core/slot/global-nav';
import { createValidatorRegistry } from '../core/validator/registry';
import { createTinaStore } from '../store/create-store';
import { testAuthPlugin } from '../test/test-auth-plugin';
import { type TinaRuntime, TinaRuntimeContext } from './context';
import { useOptionalAuthSlice, useRpcClient } from './hooks';

const bootRuntime = async (plugins: PluginManifest[]): Promise<TinaRuntime> => {
  const resolved = await resolveClientSegments(plugins);
  const screens = createScreenRegistry(resolved, plugins);
  return {
    registry: createFieldRegistry(resolved),
    validators: createValidatorRegistry(resolved),
    hooks: createFormHookRegistry(resolved),
    store: createTinaStore(resolved),
    schema: { collections: [] },
    screens,
    globalNav: createGlobalNav(resolved, plugins, screens),
  };
};

const wrapperFor =
  (runtime: TinaRuntime) =>
  ({ children }: { children: ReactNode }) => (
    <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>
  );

const boot = async (plugins: PluginManifest[]) => {
  const runtime = await bootRuntime(plugins);
  const authorizations: (string | null)[] = [];
  const { result } = renderHook(
    () => ({
      auth: useOptionalAuthSlice(),
      rpc: useRpcClient<{ search: { query: () => Promise<unknown> } }>({
        url: 'http://tina.local/api/tina',
        fetch: async (input, init) => {
          authorizations.push(
            new Request(input, init).headers.get('authorization')
          );
          return Response.json([]);
        },
      }),
    }),
    { wrapper: wrapperFor(runtime) }
  );
  return { result, authorizations };
};

const malformedAuthPlugin = (slice: Record<string, unknown>) =>
  definePlugin({
    name: 'test:malformed-auth',
    provides: ['auth'],
    client: async () => ({ default: { slice: () => slice } }),
  });

const ada: AuthUser = { id: toUserId('ada'), name: 'Ada' };
const grace: AuthUser = { id: toUserId('grace'), name: 'Grace' };
const sessionMembers = {
  getToken: async () => 'x',
  login: async () => {},
  logout: async () => {},
};

describe('useOptionalAuthSlice', () => {
  it.each([
    ['signed-in with no user', { status: 'signed-in', user: null }],
    ['signed-in with no roles', { status: 'signed-in', user: ada }],
    [
      'a LoginScreen that is not a component',
      { status: 'signed-out', user: null, LoginScreen: 'Sign in' },
    ],
  ])('names the capability when the slice is %s', async (_case, state) => {
    const runtime = await bootRuntime([
      malformedAuthPlugin({ ...sessionMembers, ...state }),
    ]);
    expect(() =>
      renderHook(() => useOptionalAuthSlice(), {
        wrapper: wrapperFor(runtime),
      })
    ).toThrow(/auth-capability-malformed/);
  });

  it('carries the roles of the editor once they sign in', async () => {
    const { result } = await boot([testAuthPlugin('test:auth', ada)]);
    await act(() => result.current.auth?.login());
    expect(result.current.auth).toMatchObject({
      status: 'signed-in',
      user: ada,
      roles: ['editor'],
    });
  });
});

describe('useRpcClient', () => {
  it("attaches the auth slice's token once the editor signs in", async () => {
    const { result, authorizations } = await boot([
      testAuthPlugin('test:auth', ada),
    ]);
    await result.current.rpc.search.query();
    await act(() => result.current.auth?.login());
    await result.current.rpc.search.query();
    expect(authorizations).toEqual([null, 'Bearer test:auth-token']);
  });

  it('takes the token from an overriding provider with no core change', async () => {
    const { result, authorizations } = await boot([
      testAuthPlugin('test:auth', ada),
      testAuthPlugin('acme:auth', grace, [{ capability: 'auth' }]),
    ]);
    await act(() => result.current.auth?.login());
    await result.current.rpc.search.query();
    expect(result.current.auth?.user).toEqual(grace);
    expect(authorizations).toEqual(['Bearer acme:auth-token']);
  });
});
