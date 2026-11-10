import { useQueryClient } from '@tanstack/react-query';
import { SaveToBranchDialog } from '@tinacms/ui/components/save-to-branch-dialog';
import { branchNameError, freeName } from '@tinacms/ui/lib/branch-name';
import { use, useEffect, useRef, useState } from 'react';
import { SaveToNewBranchContext } from '../../admin/save-to-new-branch';
import { authSliceOf } from '../../core/auth/slice';
import { currentBranchOf } from '../../core/branch/contract';
import { MediaError } from '../../core/media/contract';
import { useBranchView } from '../../editor/branch';
import { useCurrentBranch } from '../../editor/content-queries';
import { TinaRuntimeContext } from '../../editor/context';
import { useMediaSlice, useOptionalAuthSlice } from '../../editor/hooks';
import { joinMediaPath, mediaNameOf, splitFilename } from './media-types';
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

const defaultBranchName = (change: MediaChange) => {
  const verb = change.kind === 'delete' ? 'remove' : 'move';
  const [only] = change.paths;
  return change.paths.length === 1 && only !== undefined
    ? `media/${verb}-${splitFilename(mediaNameOf(only)).base}`
    : `media/${verb}-${change.paths.length}-files`;
};

const changeWords = (change: MediaChange) =>
  `${change.kind === 'delete' ? 'deleting' : 'moving'} ${subjectOf(change.paths)}`;

interface PendingBranch {
  change: MediaChange;
  documents: number;
  defaultName: string;
}

/**
 * Runs Delete and Move for the Media pane: one file at a time, the protected-branch
 * dialog first, and the permission lock learned from a refused call.
 */
export function useMediaChanges(
  onSettled: (result: ChangeResult) => void,
  onBranchDrift: () => void
) {
  const media = useMediaSlice();
  const runtime = use(TinaRuntimeContext);
  const handler = use(SaveToNewBranchContext);
  const view = useBranchView();
  const branch = useCurrentBranch() ?? '';
  const auth = useOptionalAuthSlice();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ChangeStatus | null>(null);
  const [lock, setLock] = useState<{ branch: string; who: string } | null>(
    null
  );
  const [pending, setPending] = useState<PendingBranch | null>(null);
  const [name, setName] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [confirmError, setConfirmError] = useState<string>();

  const who = `${auth?.status ?? 'none'}:${auth?.user?.id ?? ''}`;
  const locked = lock !== null && lock.branch === branch && lock.who === who;
  const busy = status?.tone === 'busy';

  useEffect(() => {
    if (status?.tone !== 'done') return;
    const timer = setTimeout(() => setStatus(null), MEDIA_DONE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const refreshMedia = (on: string) => {
    void queryClient.invalidateQueries({ queryKey: [...MEDIA_LIST_KEY, on] });
    void queryClient.invalidateQueries({
      queryKey: ['tina', 'media', 'usage'],
    });
  };

  // A listing mounted after the run began misses the direct refresh, so refresh again after the render.
  const [settledOn, setSettledOn] = useState({ branch: '', count: 0 });
  useEffect(() => {
    if (settledOn.count > 0) refreshMedia(settledOn.branch);
  }, [settledOn]);

  const isProtected =
    view?.mode === 'branches' &&
    view.listState === 'ready' &&
    view.name !== undefined &&
    view.branches.some((entry) => entry.name === view.name && entry.protected);
  const listed = view?.branches.map((entry) => entry.name) ?? [];

  const liveBranch = (): string =>
    runtime ? (currentBranchOf(runtime.store.getState()) ?? '') : branch;

  const expectedBranch = useRef<string | null>(null);
  const lastBranch = useRef(branch);
  const cancelled = useRef(false);
  useEffect(() => {
    if (lastBranch.current === branch) return;
    lastBranch.current = branch;
    if (expectedBranch.current === branch) return;
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
    refreshMedia(bound);
    setSettledOn((current) => ({ branch: bound, count: current.count + 1 }));
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

  const continueOnNewBranch = async (
    change: MediaChange,
    documents: number,
    chosen: string
  ) => {
    setStatus({ tone: 'busy', text: 'Making the branch' });
    expectedBranch.current = chosen;
    try {
      await handler?.({ kind: 'media', name: chosen, reason: 'protected' });
    } catch (cause) {
      console.error('[tinacms] Could not make the branch:', cause);
      setStatus({
        tone: 'error',
        text: "Couldn't make the branch. Try again.",
        retry: () => void continueOnNewBranch(change, documents, chosen),
      });
      expectedBranch.current = null;
      return;
    }
    if (liveBranch() !== chosen) {
      setStatus({
        tone: 'error',
        text: `Couldn't switch to the new branch. Nothing was ${change.kind === 'delete' ? 'deleted' : 'moved'}.`,
      });
      expectedBranch.current = null;
      return;
    }
    await run(change, change.paths, documents, chosen);
    expectedBranch.current = null;
  };

  const request = (change: MediaChange, documents: number) => {
    if (!isProtected) {
      void run(change, change.paths, documents, liveBranch());
      return;
    }
    const defaultName = freeName(defaultBranchName(change), listed);
    setName(defaultName);
    setRevealed(false);
    setConfirmError(undefined);
    setPending({ change, documents, defaultName });
  };

  const confirmBranch = (typed: string) => {
    if (!pending) return;
    const chosen = typed.trim();
    setRevealed(true);
    if (!handler || branchNameError(chosen, listed, true)) return;
    const { change, documents } = pending;
    setPending(null);
    void continueOnNewBranch(change, documents, chosen);
  };

  const dialog = pending ? (
    <SaveToBranchDialog
      open
      onOpenChange={(open) => {
        if (!open) setPending(null);
      }}
      branch={view?.name ?? ''}
      change={changeWords(pending.change)}
      name={name}
      onNameChange={(next) => {
        setName(next);
        setRevealed(true);
        setConfirmError(undefined);
      }}
      error={confirmError ?? branchNameError(name.trim(), listed, revealed)}
      canSave={handler !== undefined}
      onSave={confirmBranch}
    />
  ) : null;

  return {
    status,
    busy,
    locked,
    request,
    dialog,
    dismissStatus: () => setStatus(null),
  };
}
