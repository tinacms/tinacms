import { use, useEffect, useMemo } from 'react';
import { useStore } from 'zustand';
import { useSaveSummary } from '../../form/form-store';
import { useCurrentBranch } from '../content-queries';
import { TinaRuntimeContext } from '../context';
import { useFieldAddress, useOptionalAuthSlice, useTinaStore } from '../hooks';
import { protectedBranchOf } from '../../core/branch/contract';
import { invariant } from '../../core/invariant';
import { UploadFormContext } from './upload-context';
import {
  type FieldNote,
  type UploadEntry,
  type UploadList,
  type UploadListState,
  type UploadOrigin,
  isSameOrigin,
  uploadListOf,
} from './upload-list';
import { type UploadBatchView, uploadViewOf } from './upload-view';
import {
  NO_UPLOAD_PERMISSION,
  SAVING_HOLD,
  WRONG_TYPE,
  protectedBranchWords,
  tooLargeReason,
} from './upload-words';

/** The upload list of this `TinaProvider` runtime. */
export function useUploadList(): UploadList {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'upload-list-outside-provider',
    'useUploadList must be used within a TinaProvider'
  );
  return uploadListOf(runtime.store);
}

export function useUploadState<Selected>(
  selector: (state: UploadListState) => Selected
): Selected {
  return useStore(useUploadList().store, selector);
}

const useSaving = (): boolean => useSaveSummary().state === 'saving';

/** The list as the Upload button, its popover and the Save progress widget read it. */
export function useUploadView(): UploadBatchView {
  const files = useUploadState((state) => state.entries);
  const seen = useUploadState((state) => state.seen);
  const settling = useUploadState((state) => state.settling);
  const progressSeen = useUploadState((state) => state.progressSeen);
  const mediaOpen = useUploadState((state) => state.mediaOpen > 0);
  const saving = useSaving();
  return useMemo(
    () =>
      uploadViewOf({ files, saving, progressSeen, seen, settling, mediaOpen }),
    [files, saving, progressSeen, seen, settling, mediaOpen]
  );
}

/**
 * Why a new file cannot start now, in words, or null: the branch is protected,
 * a save runs, or an upload was refused for this branch and this user.
 */
export function useUploadHold(): string | null {
  const lock = useUploadState((state) => state.lock);
  const branch = useCurrentBranch() ?? '';
  const auth = useOptionalAuthSlice();
  const saving = useSaving();
  const protectedName = useTinaStore(protectedBranchOf);
  const who = `${auth?.status ?? 'none'}:${auth?.user?.id ?? ''}`;
  if (protectedName !== undefined) return protectedBranchWords(protectedName);
  if (lock !== null && lock.branch === branch && lock.who === who) {
    return NO_UPLOAD_PERMISSION;
  }
  return saving ? SAVING_HOLD : null;
}

/** Whether the upload lock holds, apart from a running save. */
export function useUploadLocked(): boolean {
  return useUploadHold() === NO_UPLOAD_PERMISSION;
}

/** The paths that landed in `folder` on this branch since the editor opened it, newest first. */
export function useFreshPaths(folder: string): string[] {
  const fresh = useUploadState((state) => state.fresh);
  const branch = useCurrentBranch() ?? '';
  return useMemo(
    () =>
      fresh
        .filter((file) => file.branch === branch && file.folder === folder)
        .map((file) => file.path),
    [fresh, branch, folder]
  );
}

/** Marks Media as open while the caller is mounted, for the Save progress widget. */
export function useMediaOpenMark(): void {
  const list = useUploadList();
  useEffect(() => list.markMediaOpen(), [list]);
}

export interface FieldUpload {
  /** The form provider instance above the field, or null outside a form. */
  form: object | null;
  /** The newest upload that fills this field, while it is listed. */
  entry: UploadEntry | undefined;
  note: FieldNote | undefined;
}

/** What the upload list holds for the image field at this address. */
export function useFieldUpload(): FieldUpload {
  const form = use(UploadFormContext);
  const address = useFieldAddress();
  const entry = useUploadState((state) =>
    state.entries.findLast(
      (candidate) =>
        candidate.field?.form === form && candidate.field.address === address
    )
  );
  const note = useUploadState((state) =>
    state.notes.find(
      (candidate) => candidate.form === form && candidate.address === address
    )
  );
  return { form, entry, note };
}

/**
 * The checks before any bytes: the type against `accepts`, then the size
 * against the provider's limit. Returns the row's reason, or null.
 */
export const uploadCheckOf =
  (
    accepts: (file: File) => boolean,
    maxSize: number | undefined,
    wrongType: string = WRONG_TYPE
  ) =>
  (file: File): string | null => {
    if (!accepts(file)) return wrongType;
    if (maxSize !== undefined && file.size > maxSize) {
      return tooLargeReason(maxSize);
    }
    return null;
  };
