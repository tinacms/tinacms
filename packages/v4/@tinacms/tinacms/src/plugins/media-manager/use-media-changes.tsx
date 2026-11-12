import { useQueryClient } from '@tanstack/react-query';
import { use, useEffect, useRef, useState } from 'react';
import { authSliceOf } from '../../core/auth/slice';
import { currentBranchOf } from '../../core/branch/contract';
import { MediaError } from '../../core/media/contract';
import { useBranchView } from '../../editor/branch';
import { useCurrentBranch } from '../../editor/content-queries';
import { TinaRuntimeContext } from '../../editor/context';
import { useMediaSlice, useOptionalAuthSlice } from '../../editor/hooks';
import { joinMediaPath, mediaNameOf } from './media-types';
import {
  MEDIA_DONE_MS,
  NO_ACCESS,
  NO_PERMISSION_NOTE,
  SESSION_EXPIRED,
  filesOf,
  subjectOf,
} from './media-pane-words';
import { MEDIA_LIST_KEY } from './use-media-listing';

export type MediaChange =
  | { kind: 'delete'; paths: readonly string[] }
  | { kind: 'move'; paths: readonly string[]; folder: string };

export interface ChangeResult {
  change: MediaChange;
  succeeded: string[];
}

export interface ChangeStatus {
  tone: 'busy' | 'done' | 'error';
  text: string;
  retry?: () => void;
}

const isNameTaken = (cause: unknown): boolean => {
  if (cause instanceof MediaError) {
    return cause.code === 'name-taken';
  } else {
    return false;
  }
};

const folderLabel = (folder: string) => folder.split('/').at(-1) || 'Media';

/**
 * Runs Delete and Move for the Media pane: one file at a time, bound to the branch
 * it was confirmed on, with the permission lock learned from a refused call.
 * `protectedBranch` names the shown branch when it is protected, so the pane
 * disables Delete and Move there.
 */
export function useMediaChanges(
  onSettled: (result: ChangeResult) => void,
  onBranchDrift: () => void
) {
  const media = useMediaSlice();
  const runtime = use(TinaRuntimeContext);
  const view = useBranchView();
  const branch = useCurrentBranch() ?? '';
  const auth = useOptionalAuthSlice();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ChangeStatus | null>(null);
  const [lock, setLock] = useState<{ branch: string; who: string } | null>(
    null
  );

  const who = `${auth?.status ?? 'none'}:${auth?.user?.id ?? ''}`;
  const locked = lock !== null && lock.branch === branch && lock.who === who;
  const busy = status?.tone === 'busy';

  useEffect(() => {
    if (status?.tone !== 'done') return;
    const timer = setTimeout(() => setStatus(null), MEDIA_DONE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refreshMedia = (on: string) => {
    void queryClient.invalidateQueries({ queryKey: [...MEDIA_LIST_KEY, on] });
    void queryClient.invalidateQueries({
      queryKey: ['tina', 'media', 'usage'],
    });
  };

  const [settledOn, setSettledOn] = useState({ branch: '', count: 0 });
  useEffect(() => {
    if (settledOn.count > 0) refreshMedia(settledOn.branch);
  }, [settledOn]);

  const protectedBranch =
    view?.mode === 'branches' &&
    view.listState === 'ready' &&
    view.branches.some((entry) => entry.name === view.name && entry.protected)
      ? view.name
      : undefined;

  const liveBranch = (): string =>
    runtime ? (currentBranchOf(runtime.store.getState()) ?? '') : branch;

  const lastBranch = useRef(branch);
  const cancelled = useRef(false);
  useEffect(() => {
    if (lastBranch.current === branch) return;
    lastBranch.current = branch;
    cancelled.current = true;
    onBranchDrift();
    setStatus((current) => (current?.tone === 'error' ? null : current));
  }, [branch]);

  const run = async (
    change: MediaChange,
    paths: readonly string[],
    documents: number,
    bound: string
  ) => {
    cancelled.current = false;
    setStatus({
      tone: 'busy',
      text: `${change.kind === 'delete' ? 'Deleting' : 'Moving'} ${subjectOf(paths)}`,
    });
    const succeeded: string[] = [];
    const failed: { path: string; cause: unknown }[] = [];
    let left = 0;
    let refused = false;
    let stopped = false;
    for (const [index, path] of paths.entries()) {
      if (cancelled.current || liveBranch() !== bound) {
        stopped = true;
        break;
      }
      try {
        if (change.kind === 'delete') {
          await media.delete(path);
        } else if (media.rename) {
          await media.rename(
            path,
            joinMediaPath(change.folder, mediaNameOf(path))
          );
        }
        succeeded.push(path);
      } catch (cause) {
        if (cause instanceof MediaError && cause.code === 'unauthorized') {
          refused = true;
          left = paths.length - index;
          break;
        }
        failed.push({ path, cause });
      }
    }
    if (mounted.current) {
      setSettledOn((current) => ({ branch: bound, count: current.count + 1 }));
    } else {
      refreshMedia(bound);
    }
    onSettled({ change: { ...change, paths }, succeeded });

    if (refused) {
      const live = runtime ? authSliceOf(runtime.store.getState()) : null;
      if (live === null || live.status === 'signed-in') {
        setLock({ branch: bound, who });
        setStatus({
          tone: 'error',
          text: `${NO_PERMISSION_NOTE} ${succeeded.length} done, ${left} left.`,
        });
      } else if (live.status === 'forbidden') {
        setStatus({ tone: 'error', text: NO_ACCESS });
      } else {
        setStatus({ tone: 'error', text: SESSION_EXPIRED });
      }
      return;
    }
    if (failed.length > 0 || stopped) {
      const verb = change.kind === 'delete' ? 'delete' : 'move';
      const taken = failed.filter(({ cause }) => isNameTaken(cause));
      const others = failed.filter((entry) => !taken.includes(entry));
      const lines = [
        ...(stopped
          ? [
              `The branch changed, so this stopped. ${change.kind === 'delete' ? 'Deleted' : 'Moved'} ${succeeded.length} of ${filesOf(paths.length)}.`,
            ]
          : []),
        ...taken.map(
          ({ path }) =>
            `${mediaNameOf(path)} is already in ${folderLabel(change.kind === 'move' ? change.folder : '')}. It wasn't moved.`
        ),
        ...(others.length > 0
          ? [`Couldn't ${verb} ${others.length} of ${filesOf(paths.length)}.`]
          : []),
      ];
      const retryPaths = others.map(({ path }) => path);
      setStatus({
        tone: 'error',
        text: lines.join(' '),
        retry:
          retryPaths.length > 0 && !stopped
            ? () => void run(change, retryPaths, documents, bound)
            : undefined,
      });
      return;
    }
    const missing =
      documents > 0
        ? ` ${documents} ${documents === 1 ? 'document now shows' : 'documents now show'} a missing image.`
        : '';
    setStatus({
      tone: 'done',
      text:
        change.kind === 'delete'
          ? `Deleted ${subjectOf(paths)}.${missing}`
          : `Moved ${subjectOf(paths)} to ${folderLabel(change.folder)}.${missing}`,
    });
  };

  const request = (change: MediaChange, documents: number) => {
    if (protectedBranch !== undefined) return;
    void run(change, change.paths, documents, liveBranch());
  };

  return {
    status,
    busy,
    locked,
    protectedBranch,
    request,
    dismissStatus: () => setStatus(null),
  };
}
