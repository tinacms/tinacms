import { toast } from '@tinacms/ui/components/toast';
import { use, useEffect, useMemo } from 'react';
import {
  type BranchListState,
  type BranchMode,
  type BranchSlice,
  branchSliceOf,
  currentBranchOf,
} from '../core/branch/contract';
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
    fill({ mode: 'branches', listState: 'loading' });
    Promise.all([source.list(), source.defaultBranch()]).then(
      ([branches, fallback]) => {
        if (cancelled) return;
        fill({
          mode: 'branches',
          listState: 'ready',
          fallback,
          list: branches.map((branch) => branch.name),
          protected: branches
            .filter((branch) => branch.protected)
            .map((branch) => branch.name),
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
  branches: { name: string; protected: boolean }[];
  /** The provider's default branch, once the list has been read. */
  defaultBranch: string | undefined;
  /** Whether the list is being read, read, or failed. */
  listState: BranchListState | undefined;
  /** Reads the branch list again after a failure. */
  retryList: () => void;
  switchTo: (name: string) => void;
}

export function useBranchView(): BranchView | null {
  const runtime = use(TinaRuntimeContext);
  const raw = useTinaStore((state) => state.branch);
  const slice = useMemo(
    () => (raw ? branchSliceOf({ branch: raw }) : undefined),
    [raw]
  );
  if (!slice) return null;
  return {
    mode: slice.mode,
    name: slice.current ?? slice.fallback,
    defaultBranch: slice.fallback,
    branches: slice.list.map((name) => ({
      name,
      protected: slice.protected.includes(name),
    })),
    listState: slice.listState,
    retryList: () =>
      runtime?.store.setState((state) => ({
        branch: {
          ...state.branch,
          attempt: Number(state.branch?.attempt ?? 0) + 1,
        },
      })),
    switchTo: slice.switchTo,
  };
}
