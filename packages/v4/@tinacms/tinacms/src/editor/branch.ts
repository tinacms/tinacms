import { toast } from '@tinacms/ui/components/toast';
import { use, useEffect, useMemo } from 'react';
import {
  type BranchListState,
  type BranchMode,
  type BranchSlice,
  branchSliceOf,
  currentBranchOf,
} from '../core/branch/contract';
import { createBranchAction } from '../core/branch/create';
import { TinaRuntimeContext } from './context';
import { useOptionalContentSlice, useTinaStore } from './hooks';

// A saved branch the provider no longer lists falls back to the default with a toast.
export function useBranchSync(): void {
  const runtime = use(TinaRuntimeContext);
  const content = useOptionalContentSlice();
  const attempt = useTinaStore((state) => Number(state.branch?.attempt ?? 0));
  useEffect(() => {
    if (!runtime || !content) return;
    const { store } = runtime;
    const fill = (patch: Partial<BranchSlice>) =>
      store.setState((state) => ({ branch: { ...state.branch, ...patch } }));
    if (content.local) {
      fill({ mode: 'local' });
      return;
    }
    const source = content.branches;
    if (!source) return;
    let cancelled = false;
    const { create } = source;
    fill({
      mode: 'branches',
      listState: 'loading',
      create: create
        ? createBranchAction(store, {
            ...source,
            create: (r) => create.call(source, r),
          })
        : undefined,
    });
    Promise.all([source.list(), source.defaultBranch()]).then(
      ([branches, fallback]) => {
        if (cancelled) return;
        const names = branches.map((branch) => branch.name);
        const pending = branchSliceOf(store.getState())?.creating?.name;
        fill({
          mode: 'branches',
          listState: 'ready',
          fallback,
          list:
            pending !== undefined && !names.includes(pending)
              ? [...names, pending]
              : names,
          protected: branches
            .filter((branch) => branch.protected)
            .map((branch) => branch.name),
          pullRequests: Object.fromEntries(
            branches.flatMap(({ name, pullRequestUrl }) =>
              pullRequestUrl ? [[name, pullRequestUrl]] : []
            )
          ),
        });
        const current = currentBranchOf(store.getState());
        if (current && current === fallback) {
          branchSliceOf(store.getState())?.switchTo(undefined);
        } else if (
          current &&
          !branches.some((branch) => branch.name === current)
        ) {
          branchSliceOf(store.getState())?.switchTo(undefined);
          toast({
            tone: 'warning',
            title: `Branch "${current}" no longer exists`,
            text: fallback ? `Switched to ${fallback}.` : undefined,
          });
        }
      },
      (cause: unknown) => {
        if (cancelled) return;
        console.warn('[tinacms] could not list branches:', cause);
        fill({ listState: 'failed' });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [runtime, content, attempt]);
}

export interface BranchView {
  mode: BranchMode | undefined;
  /** The branch edits save to: the chosen one, else the default. */
  name: string | undefined;
  /** The pull request of the branch `name`, when it has one. */
  pullRequestUrl: string | undefined;
  branches: { name: string; protected: boolean }[];
  /** Branches made this session that are not ready and cannot be switched to until a reload. */
  unready: string[];
  /** The provider's default branch, once the list has been read. */
  defaultBranch: string | undefined;
  /** Whether the list is being read, read, or failed. */
  listState: BranchListState | undefined;
  /** Reads the branch list again after a failure. */
  retryList: () => void;
  switchTo: (name: string) => void;
  saveToNewBranch: BranchSlice['saveToNewBranch'];
  /** Makes a branch through the provider. Absent when the provider cannot. */
  create: BranchSlice['create'];
  /** The branch being made by this session, if any. */
  creating: BranchSlice['creating'];
  createResult: BranchSlice['createResult'];
}

export function useBranchView(): BranchView | null {
  const runtime = use(TinaRuntimeContext);
  const raw = useTinaStore((state) => state.branch);
  const slice = useMemo(
    () => (raw ? branchSliceOf({ branch: raw }) : undefined),
    [raw]
  );
  if (!slice) return null;
  const name = slice.current ?? slice.fallback;
  return {
    mode: slice.mode,
    name,
    pullRequestUrl: name ? slice.pullRequests[name] : undefined,
    defaultBranch: slice.fallback,
    branches: slice.list.map((name) => ({
      name,
      protected: slice.protected.includes(name),
    })),
    unready: slice.unready,
    listState: slice.listState,
    retryList: () =>
      runtime?.store.setState((state) => ({
        branch: {
          ...state.branch,
          attempt: Number(state.branch?.attempt ?? 0) + 1,
        },
      })),
    switchTo: slice.switchTo,
    saveToNewBranch: slice.saveToNewBranch,
    create: slice.create,
    creating: slice.creating,
    createResult: slice.createResult,
  };
}
