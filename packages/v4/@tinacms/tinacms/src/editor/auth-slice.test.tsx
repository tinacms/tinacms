import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { createStore } from 'zustand';
import {
  type PluginManifest,
  type TinaStoreState,
  resolveClientSegments,
} from '../core/plugin';
import { createTinaStore } from '../store/create-store';
import { testAuthPlugin } from '../test/test-auth-plugin';
import { type TinaRuntime, TinaRuntimeContext } from './context';
import { useAuthSlice, useRpcClient } from './hooks';

const wrapperFor = (store: TinaRuntime['store']) => {
  const runtime = { store } as unknown as TinaRuntime;
  return ({ children }: { children: ReactNode }) => (
    <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>
  );
};

const boot = async (plugins: PluginManifest[]) => {
  const store = createTinaStore(await resolveClientSegments(plugins));
  const authorizations: (string | null)[] = [];
  const { result } = renderHook(
    () => ({
      auth: useAuthSlice(),
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
    { wrapper: wrapperFor(store) }
  );
  return { result, authorizations };
};

const ada = { id: 'ada', name: 'Ada' };
const grace = { id: 'grace', name: 'Grace' };

describe('useAuthSlice', () => {
  it('names the capability when the auth slice is malformed', () => {
    const store = createStore<TinaStoreState>()(() => ({
      auth: { status: 'signed-in', user: null, getToken: async () => 'x' },
    }));
    expect(() =>
      renderHook(() => useAuthSlice(), { wrapper: wrapperFor(store) })
    ).toThrow(/auth-capability-malformed/);
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
