import { useCMS, useEvent } from '@toolkit/react-core';
import * as React from 'react';
import { Branch, BranchChangeEvent } from './types';

export interface BranchContextData {
  currentBranch: string;
  setCurrentBranch: (string) => void;
}

const BranchContext = React.createContext<BranchContextData>({
  currentBranch: null,
  setCurrentBranch: (branch) => {
    console.warn('BranchContext not initialized');
  },
});

export const BranchDataProvider = ({
  currentBranch,
  setCurrentBranch,
  children,
}) => {
  return (
    <BranchContext.Provider
      value={{
        currentBranch,
        setCurrentBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranchData: () => BranchContextData = () => {
  const branchData = React.useContext(BranchContext);
  const { dispatch } = useEvent<BranchChangeEvent>('branch:change');
  React.useEffect(() => {
    dispatch({ branchName: branchData.currentBranch });
  }, [branchData.currentBranch]);
  return branchData;
};

export type BranchIndexStatus = NonNullable<Branch['indexStatus']>;

export const INDEX_STATUS_POLL_INTERVAL = 5000;
export const MAX_CONCURRENT_INDEX_STATUS_REQUESTS = 3;
const MAX_UNKNOWN_STATUS_RESPONSES = 5;

const isIndexing = (status?: BranchIndexStatus) =>
  status?.status === 'inprogress' || status?.status === 'unknown';

/**
 * Fetches index statuses for the branches that are actually being looked at
 * instead of every branch in the repository. Rows register themselves through
 * `getRowRef`; only the current branch and the rows currently in view are
 * requested, a few at a time, and only those rows are polled while indexing.
 */
export const useBranchIndexStatuses = ({
  branchNames,
  currentBranch,
}: {
  branchNames: string[];
  currentBranch?: string;
}) => {
  const cms = useCMS();
  const [statuses, setStatuses] = React.useState<
    Record<string, BranchIndexStatus>
  >({});
  const [visibleBranchNames, setVisibleBranchNames] = React.useState<string[]>(
    []
  );
  const [loadAll, setLoadAll] = React.useState(false);

  const mounted = React.useRef(false);
  const inFlight = React.useRef(new Set<string>());
  const unknownResponses = React.useRef(new Map<string, number>());
  const observer = React.useRef<IntersectionObserver | null>(null);
  const observedElements = React.useRef(new Map<Element, string>());
  const rowElements = React.useRef(new Map<string, HTMLElement>());
  const rowRefs = React.useRef(
    new Map<string, (element: HTMLElement | null) => void>()
  );

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      observer.current?.disconnect();
      observer.current = null;
    };
  }, []);

  const setVisibility = React.useCallback(
    (branchName: string, isVisible: boolean) => {
      setVisibleBranchNames((previous) => {
        const wasVisible = previous.includes(branchName);
        if (wasVisible === isVisible) return previous;
        return isVisible
          ? [...previous, branchName]
          : previous.filter((name) => name !== branchName);
      });
    },
    []
  );

  const observeRow = React.useCallback(
    (branchName: string, element: HTMLElement | null) => {
      const previous = rowElements.current.get(branchName);
      if (!element) {
        if (!previous) return;
        rowElements.current.delete(branchName);
        observedElements.current.delete(previous);
        observer.current?.unobserve(previous);
        setVisibility(branchName, false);
        return;
      }
      if (previous && previous !== element) {
        observedElements.current.delete(previous);
        observer.current?.unobserve(previous);
      }
      rowElements.current.set(branchName, element);
      if (typeof IntersectionObserver === 'undefined') {
        setVisibility(branchName, true);
        return;
      }
      if (!observer.current) {
        observer.current = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            const name = observedElements.current.get(entry.target);
            if (name) setVisibility(name, entry.isIntersecting);
          }
        });
      }
      observedElements.current.set(element, branchName);
      observer.current.observe(element);
    },
    [setVisibility]
  );

  const getRowRef = React.useCallback(
    (branchName: string) => {
      let ref = rowRefs.current.get(branchName);
      if (!ref) {
        ref = (element: HTMLElement | null) => observeRow(branchName, element);
        rowRefs.current.set(branchName, ref);
      }
      return ref;
    },
    [observeRow]
  );

  const wantedKey = React.useMemo(() => {
    const wanted = new Set<string>();
    if (currentBranch) wanted.add(currentBranch);
    for (const name of visibleBranchNames) wanted.add(name);
    if (loadAll) for (const name of branchNames) wanted.add(name);
    return [...wanted].sort().join('\n');
  }, [branchNames, currentBranch, loadAll, visibleBranchNames]);

  const wantedBranchNames = React.useMemo(
    () => (wantedKey ? wantedKey.split('\n') : []),
    [wantedKey]
  );

  const fetchIndexStatus = React.useCallback(
    async (branchName: string) => {
      if (inFlight.current.has(branchName)) return;
      inFlight.current.add(branchName);
      try {
        const indexStatus = await cms.api.tina.getIndexStatus({
          ref: branchName,
        });
        if (!mounted.current) return;
        unknownResponses.current.set(
          branchName,
          indexStatus?.status === 'unknown'
            ? (unknownResponses.current.get(branchName) ?? 0) + 1
            : 0
        );
        setStatuses((previous) => ({ ...previous, [branchName]: indexStatus }));
      } catch {
        // Leave the row without a status. Reopening the list retries the lookup.
      } finally {
        inFlight.current.delete(branchName);
      }
    },
    [cms]
  );

  // Drains the wanted branches a few at a time. Runs again whenever a branch
  // scrolls into view or the Last Updated sort asks for every remaining one.
  React.useEffect(() => {
    const queue = wantedBranchNames.filter(
      (name) => !statuses[name] && !inFlight.current.has(name)
    );
    if (!queue.length) return;
    let cancelled = false;
    const worker = async () => {
      while (!cancelled) {
        const name = queue.shift();
        if (!name) return;
        await fetchIndexStatus(name);
      }
    };
    const workerCount = Math.min(
      MAX_CONCURRENT_INDEX_STATUS_REQUESTS,
      queue.length
    );
    for (let index = 0; index < workerCount; index++) {
      void worker();
    }
    return () => {
      cancelled = true;
    };
  }, [wantedKey, fetchIndexStatus]);

  const pollingKey = React.useMemo(() => {
    const polling = wantedBranchNames.filter(
      (name) =>
        isIndexing(statuses[name]) &&
        (unknownResponses.current.get(name) ?? 0) < MAX_UNKNOWN_STATUS_RESPONSES
    );
    return polling.sort().join('\n');
  }, [wantedBranchNames, statuses]);

  // Polls only the wanted rows that are still indexing. The interval is torn
  // down as soon as a row leaves the view, the list closes, or indexing ends.
  React.useEffect(() => {
    if (!pollingKey) return;
    const names = pollingKey
      .split('\n')
      .slice(0, MAX_CONCURRENT_INDEX_STATUS_REQUESTS);
    const interval = setInterval(() => {
      for (const name of names) {
        void fetchIndexStatus(name);
      }
    }, INDEX_STATUS_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [pollingKey, fetchIndexStatus]);

  const loadAllStatuses = React.useCallback(() => setLoadAll(true), []);

  return { statuses, getRowRef, loadAllStatuses };
};

export const mergeBranchIndexStatuses = (
  branchList: Branch[],
  statuses: Record<string, BranchIndexStatus>
) =>
  branchList.map((branch) =>
    statuses[branch.name]
      ? { ...branch, indexStatus: statuses[branch.name] }
      : branch
  );
