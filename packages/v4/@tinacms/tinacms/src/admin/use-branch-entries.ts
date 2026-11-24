import type { BranchEntry } from '@tinacms/ui/components/branch-switcher';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { branchSliceOf } from '../core/branch/contract';
import { useTinaStore } from '../editor/hooks';
import { parsePullRequest } from '../core/branch/pull-request';
import type { BranchView } from '../editor/branch';
import { listStoredDraftIds } from '../form/drafts';
import { formStatus, openFormIds, useFormStore } from '../form/form-store';

const NO_COUNTS: Record<string, number> = {};

/**
 * This editor's unsaved documents per branch. The current branch counts the same set as
 * Home's "Review N unsaved"; the others count their stored drafts. Reads storage only while
 * `open`, so editing with the switcher closed costs nothing.
 */
function useUnsavedCounts(
  names: string[],
  defaultBranch: string | undefined,
  open: boolean
): Record<string, number> {
  return useFormStore(
    useShallow((state) => {
      if (!open) return NO_COUNTS;
      const counts: Record<string, number> = {};
      for (const name of names) {
        const key = name === defaultBranch ? undefined : name;
        const stored = listStoredDraftIds(state.userId, key);
        const dirty =
          key === state.branch
            ? openFormIds(state.forms).filter(
                (id) => formStatus(state.forms[id]) === 'dirty'
              )
            : [];
        const count = new Set([...dirty, ...stored]).size;
        if (count > 0) counts[name] = count;
      }
      return counts;
    })
  );
}

/** The switcher's rows: pull request numbers, unsaved counts, and the branch being made. */
export function useBranchEntries(
  branch: BranchView | null,
  open: boolean
): BranchEntry[] {
  const raw = useTinaStore((state) => state.branch);
  const pullRequests = useMemo(
    () => (raw ? branchSliceOf({ branch: raw })?.pullRequests : undefined),
    [raw]
  );
  const names = branch?.branches.map((entry) => entry.name) ?? [];
  const counts = useUnsavedCounts(names, branch?.defaultBranch, open);
  if (!branch) return [];
  const creating = branch.creating?.name;
  const rows = branch.branches.map((entry) => ({
    name: entry.name,
    protected: entry.protected,
    pullRequest: parsePullRequest(pullRequests?.[entry.name])?.number,
    unsaved: counts[entry.name],
    ready:
      entry.name === creating ||
      (branch.unready.includes(entry.name) && entry.name !== branch.name)
        ? false
        : undefined,
  }));
  return [
    ...rows.filter((row) => row.name === creating),
    ...rows.filter((row) => row.name !== creating),
  ];
}
