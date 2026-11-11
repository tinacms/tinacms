import { isRecord } from '../../utils/is-record';
import type { SliceState, TinaStoreState } from '../plugin';

export interface BranchInfo {
  name: string;
  protected?: boolean;
  /** The branch's pull request, when the provider knows of one. */
  pullRequestUrl?: string;
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
  /** Branch name to pull request URL, for the branches that have one. */
  pullRequests: Record<string, string>;
  /** Whether the branch list is being read, read, or failed to read. Absent until the first read starts. */
  listState?: BranchListState;
  switchTo: (name: string | undefined) => void;
}

export type BranchListState = 'loading' | 'ready' | 'failed';

const isNames = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((name) => typeof name === 'string');

const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value ? value : undefined;

const pullRequestsOf = (value: unknown): Record<string, string> => {
  if (!isRecord(value)) return {};
  const urls: Record<string, string> = {};
  for (const [name, url] of Object.entries(value)) {
    if (typeof url === 'string' && url) urls[name] = url;
  }
  return urls;
};

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
    pullRequests: pullRequestsOf(slice.pullRequests),
    listState:
      slice.listState === 'loading' ||
      slice.listState === 'ready' ||
      slice.listState === 'failed'
        ? slice.listState
        : undefined,
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
