import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import type { BranchInfo } from '../core/branch/contract';
import { createTinaStore } from '../store/create-store';
import { useBranchSync, useBranchView } from './branch';
import { type TinaRuntime, TinaRuntimeContext } from './context';
import { connectionOf } from '../test/connection';

const NEWS_PR = 'https://github.com/acme/site/pull/12';

const renderBranchView = (branches: BranchInfo[]) => {
  const store = createTinaStore([]);
  store.setState({
    content: {
      get: async () => undefined,
      list: async () => connectionOf([]),
      update: async () => undefined,
      branches: {
        list: async () => branches,
        defaultBranch: async () => 'main',
      },
    },
  });
  const runtime = { store } as unknown as TinaRuntime;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>
  );
  const view = renderHook(
    () => {
      useBranchSync();
      return useBranchView();
    },
    { wrapper }
  );
  return { ...view, store };
};

describe('useBranchView pullRequestUrl', () => {
  it("gives the current branch's pull request and never another branch's after a switch", async () => {
    const { result } = renderBranchView([
      { name: 'main', pullRequestUrl: '' },
      { name: 'feature/news', pullRequestUrl: NEWS_PR },
      { name: 'feature/docs' },
    ]);
    await waitFor(() => expect(result.current?.listState).toBe('ready'));
    expect(result.current?.name).toBe('main');
    expect(result.current?.pullRequestUrl).toBeUndefined();

    act(() => result.current?.switchTo('feature/news'));
    expect(result.current?.pullRequestUrl).toBe(NEWS_PR);

    act(() => result.current?.switchTo('feature/docs'));
    expect(result.current?.name).toBe('feature/docs');
    expect(result.current?.pullRequestUrl).toBeUndefined();
  });

  it('gives no pull request when the slice has no usable pullRequests map', async () => {
    const { result, store } = renderBranchView([
      { name: 'main', pullRequestUrl: NEWS_PR },
    ]);
    await waitFor(() => expect(result.current?.pullRequestUrl).toBe(NEWS_PR));

    act(() =>
      store.setState((state) => ({
        branch: { ...state.branch, pullRequests: { main: 12, other: '' } },
      }))
    );
    expect(result.current?.name).toBe('main');
    expect(result.current?.pullRequestUrl).toBeUndefined();

    act(() =>
      store.setState((state) => {
        const { pullRequests: _dropped, ...branch } = state.branch ?? {};
        return { branch };
      }, true)
    );
    expect(result.current?.name).toBe('main');
    expect(result.current?.pullRequestUrl).toBeUndefined();
  });
});
