import type { SliceState, TinaStoreState } from '../plugin';

export interface BranchInfo {
  name: string;
  protected?: boolean;
}

/**
 * Optional on a `content` provider. A provider that offers branches fills the
 * core `branch` slice from this; a provider without it shows no branch spot.
 */
export interface BranchSource {
  list(): Promise<BranchInfo[]>;
  /** The branch an editor sees when `branch.current` is unset. */
  defaultBranch(): Promise<string | undefined>;
}

export type BranchMode = 'local' | 'branches';

/**
 * The core `branch` slice (editorial-workflow.md). `current` is the only field
 * the store persists; every other field is rebuilt from the content provider.
 */
export interface BranchSlice {
  mode?: BranchMode;
  current?: string;
  /** The default branch name, shown while `current` is unset. */
  fallback?: string;
  list: string[];
  protected: string[];
  switchTo: (name: string | undefined) => void;
}

const isNames = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((name) => typeof name === 'string');

const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value ? value : undefined;

export const branchSliceOf = (
  state: TinaStoreState
): BranchSlice | undefined => {
  const slice: SliceState | undefined = state.branch;
  if (!slice) return undefined;
  const { switchTo, list, protected: protectedNames, mode } = slice;
  if (typeof switchTo !== 'function') return undefined;
  if (!isNames(list) || !isNames(protectedNames)) return undefined;
  return {
    mode: mode === 'local' || mode === 'branches' ? mode : undefined,
    current: optionalString(slice.current),
    fallback: optionalString(slice.fallback),
    list,
    protected: protectedNames,
    switchTo: (name) => switchTo(name),
  };
};

/**
 * The branch edits read from and write to, or undefined for the default.
 * `switchTo` stores undefined when the pick is the default branch, so the
 * default has one cache key and one draft key.
 */
export const currentBranchOf = (state: TinaStoreState): string | undefined => {
  const { current } = state.branch ?? {};
  return typeof current === 'string' && current ? current : undefined;
};
