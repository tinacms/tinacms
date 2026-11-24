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

describe('useBranchSync list re-read during a create', () => {
  const reread = async (patch: Record<string, unknown>) => {
    const { result, store } = renderBranchView([{ name: 'main' }]);
    await waitFor(() => expect(result.current?.listState).toBe('ready'));
    act(() =>
      store.setState((state) => ({ branch: { ...state.branch, ...patch } }))
    );
    act(() => result.current?.retryList());
    await waitFor(() => expect(result.current?.listState).toBe('ready'));
    return result;
  };
  const making = (phase: 'making' | 'preparing') => ({
    creating: { name: 'cms/x', from: 'main', startedOn: undefined, phase },
  });
  const names = (view: ReturnType<typeof useBranchView>) =>
    view?.branches.map((branch) => branch.name);

  it('adds no row for a name still being made, so a create that then fails leaves nothing behind', async () => {
    const result = await reread(making('making'));
    expect(names(result.current)).toEqual(['main']);
  });

  it('shows the pending name once the branch is being prepared', async () => {
    const result = await reread(making('preparing'));
    expect(names(result.current)).toEqual(['main', 'cms/x']);
  });

  it('puts back an unready branch the re-read list omits, once', async () => {
    const result = await reread({ unready: ['cms/u'] });
    expect(names(result.current)).toEqual(['main', 'cms/u']);
  });
});

describe('useBranchSync list re-read that outlasts a create', () => {
  const setup = () => {
    const store = createTinaStore([]);
    const reads: (() => void)[] = [];
    let finishCreate: (name: string) => void = () => {};
    store.setState({
      content: {
        get: async () => undefined,
        list: async () => connectionOf([]),
        update: async () => undefined,
        branches: {
          list: () =>
            new Promise<BranchInfo[]>((resolve) => {
              reads.push(() => resolve([{ name: 'main' }]));
            }),
          defaultBranch: async () => 'main',
          create: () =>
            new Promise<{ name: string }>((resolve) => {
              finishCreate = (name) => resolve({ name });
            }),
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
    return { view, reads, finish: (name: string) => finishCreate(name) };
  };
  const names = (view: ReturnType<typeof useBranchView>) =>
    view?.branches.map((branch) => branch.name);

  it('keeps a branch that ended ready when the older list resolves late, and again when a later read omits it', async () => {
    const { view, reads, finish } = setup();
    await waitFor(() => expect(reads).toHaveLength(1));
    act(() => reads[0]());
    await waitFor(() => expect(view.result.current?.listState).toBe('ready'));
    act(() => view.result.current?.create?.('cms/n', 'main'));
    act(() => view.result.current?.retryList());
    await waitFor(() => expect(reads).toHaveLength(2));
    act(() => finish('cms/n'));
    await waitFor(() => expect(view.result.current?.creating).toBeUndefined());
    expect(names(view.result.current)).toEqual(['main', 'cms/n']);
    act(() => reads[1]());
    await waitFor(() => expect(view.result.current?.listState).toBe('ready'));
    expect(names(view.result.current)).toEqual(['main', 'cms/n']);
    act(() => view.result.current?.retryList());
    await waitFor(() => expect(reads).toHaveLength(3));
    act(() => reads[2]());
    await waitFor(() => expect(view.result.current?.listState).toBe('ready'));
    expect(names(view.result.current)).toEqual(['main', 'cms/n']);
  });

  it('does not switch away from a branch that ended ready when the older list omits it', async () => {
    const { view, reads, finish } = setup();
    await waitFor(() => expect(reads).toHaveLength(1));
    act(() => reads[0]());
    await waitFor(() => expect(view.result.current?.listState).toBe('ready'));
    act(() => view.result.current?.create?.('cms/n', 'main'));
    act(() => view.result.current?.retryList());
    await waitFor(() => expect(reads).toHaveLength(2));
    act(() => finish('cms/n'));
    await waitFor(() => expect(view.result.current?.creating).toBeUndefined());
    act(() => view.result.current?.switchTo('cms/n'));
    act(() => reads[1]());
    await waitFor(() => expect(view.result.current?.listState).toBe('ready'));
    expect(view.result.current?.name).toBe('cms/n');
  });
});
