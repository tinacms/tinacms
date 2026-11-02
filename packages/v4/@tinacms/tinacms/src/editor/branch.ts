import { toast } from '@tinacms/ui/components/toast';
import { use, useEffect } from 'react';
import {
  type BranchMode,
  branchSliceOf,
  currentBranchOf,
} from '../core/branch/contract';
import { TinaRuntimeContext } from './context';
import { useOptionalContentSlice, useTinaStore } from './hooks';

/**
 * Fills the core `branch` slice from the content provider: `local` gives
 * mode `local`, `branches` gives mode `branches` with the list and the
 * protected names. A provider with neither leaves the mode unset, so the shell
 * shows no branch spot. A saved branch that no longer exists falls back to the
 * default branch with a toast.
 */
export function useBranchSync(): void {
  const runtime = use(TinaRuntimeContext);
  const content = useOptionalContentSlice();
  useEffect(() => {
    if (!runtime || !content) return;
    const { store } = runtime;
    const fill = (patch: Record<string, unknown>) =>
      store.setState((state) => ({ branch: { ...state.branch, ...patch } }));
    if (content.local) {
      fill({ mode: 'local' });
      return;
    }
    const source = content.branches;
    if (!source) return;
    let cancelled = false;
    Promise.all([source.list(), source.defaultBranch()]).then(
      ([branches, fallback]) => {
        if (cancelled) return;
        fill({
          mode: 'branches',
          fallback,
          list: branches.map((branch) => branch.name),
          protected: branches
            .filter((branch) => branch.protected)
            .map((branch) => branch.name),
        });
        const current = currentBranchOf(store.getState());
        if (current && !branches.some((branch) => branch.name === current)) {
          branchSliceOf(store.getState())?.switchTo(undefined);
          toast({
            tone: 'warning',
            title: `Branch "${current}" no longer exists`,
            text: fallback ? `Switched to ${fallback}.` : undefined,
          });
        }
      },
      (cause: unknown) => {
        console.warn('[tinacms] could not list branches:', cause);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [runtime, content]);
}

export interface BranchView {
  mode: BranchMode | undefined;
  /** The branch edits save to: the chosen one, else the default. */
  name: string | undefined;
  branches: { name: string; protected: boolean }[];
  switchTo: (name: string) => void;
}

export function useBranchView(): BranchView | null {
  const slice = useTinaStore(branchSliceOf);
  if (!slice) return null;
  return {
    mode: slice.mode,
    name: slice.current ?? slice.fallback,
    branches: slice.list.map((name) => ({
      name,
      protected: slice.protected.includes(name),
    })),
    switchTo: slice.switchTo,
  };
}
