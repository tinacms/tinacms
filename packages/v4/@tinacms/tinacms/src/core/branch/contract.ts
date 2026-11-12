import { isRecord } from '../../utils/is-record';
import type { DocumentEntry } from '../content/contract';
import type { SliceState, TinaStoreState } from '../plugin';
import type { TinaDocument } from '../schema/types';

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
  /**
   * Makes branch `name` from `from` (the default branch when undefined) and
   * writes `value` to it in one request. All or nothing: when it rejects, no
   * branch exists. Absent until a provider offers it.
   */
  saveToNewBranch?: (request: {
    name: string;
    from: string | undefined;
    collection: string;
    path: string;
    value: TinaDocument;
  }) => Promise<DocumentEntry & { hookWarnings?: string[] }>;
}

type SaveToNewBranch = NonNullable<BranchSlice['saveToNewBranch']>;

const isSaveToNewBranch = (value: unknown): value is SaveToNewBranch =>
  typeof value === 'function';

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
  const {
    switchTo,
    list,
    protected: protectedNames,
    mode,
    saveToNewBranch,
  } = slice;
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
    saveToNewBranch: isSaveToNewBranch(saveToNewBranch)
      ? (request) => saveToNewBranch(request)
      : undefined,
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

/** The branch edits go to when it is protected and the branch list is ready, else undefined. */
export const protectedBranchOf = (
  state: TinaStoreState
): string | undefined => {
  const slice = branchSliceOf(state);
  if (slice?.mode !== 'branches' || slice.listState !== 'ready') {
    return undefined;
  }
  const name = slice.current ?? slice.fallback;
  return name !== undefined && slice.protected.includes(name)
    ? name
    : undefined;
};
