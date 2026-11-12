import {
  BRANCH_CHANGED,
  WAITING_FOR_SAVE,
  filesWord,
  folderLabelOf,
  sizeLabelOf,
  takenNote,
} from './upload-words';

export type UploadStatus =
  | 'waiting'
  | 'uploading'
  | 'done'
  | 'failed'
  | 'cancelled';

/** One file of the upload list, as the view model reads it. */
export interface UploadFileState {
  id: string;
  /** The name the file was picked with. */
  name: string;
  size: number;
  folder: string;
  status: UploadStatus;
  /** 0 to 1 of the bytes sent, or null while the provider has reported none. */
  fraction: number | null;
  /** Every byte is sent, so the file can no longer be cancelled. */
  sent: boolean;
  /** Cancel was pressed while the bytes were on their way. */
  cancelling: boolean;
  /** The name in the path that `upload` returned. */
  savedAs?: string;
  /** The picked name was taken, so the file was saved under a numbered name. */
  taken: boolean;
  reason?: string;
  /** What a failed row offers. */
  recovery?: 'retry' | 'remove';
  /** A `blob:` URL of an image file, for the row's small picture. */
  preview?: string;
}

export interface UploadViewInput {
  files: readonly UploadFileState[];
  /** A save runs, so files that have not started wait for it. */
  saving: boolean;
  /** The provider has reported progress at least once on this list. */
  progressSeen: boolean;
  /** The list was opened since the last failure. */
  seen: boolean;
  /** The batch ended with no failure and the list has not emptied yet. */
  settling: boolean;
  /** The Media pane or the picker is open. */
  mediaOpen: boolean;
}

export interface UploadRow {
  id: string;
  name: string;
  kind: 'run' | 'wait' | 'ok' | 'flag' | 'fail' | 'off';
  /** "Uploading 40% · 6.1 MB", why it failed, or where it went. */
  meta: string;
  /** 0 to 100 for the thin progress line, or null when there is none to draw. */
  percent: number | null;
  action?: 'cancel' | 'retry' | 'remove';
  preview?: string;
}

export type UploadButtonLook =
  | { mode: 'idle' }
  | { mode: 'run'; words: string; percent: number }
  | { mode: 'done'; count: number }
  | { mode: 'failed'; count: number };

/** The batch as plain data, for the Save progress widget (#7630). */
export interface UploadBatchView {
  /** The count of files in the list. */
  files: number;
  /** The file the batch is on, from 1. */
  at: number;
  /** 0 to 100. */
  progress: number;
  head: string;
  tone: 'run' | 'fail' | 'ok';
  rows: UploadRow[];
  button: UploadButtonLook;
  mediaOpen: boolean;
}

const isLive = (file: UploadFileState) =>
  file.status === 'waiting' || file.status === 'uploading';

// The storage still has work to do after the last byte, so a row never reads 100%.
const shownPercent = (fraction: number) =>
  Math.min(99, Math.round(fraction * 100));

const rowOf = (file: UploadFileState, input: UploadViewInput): UploadRow => {
  const base = { id: file.id, preview: file.preview };
  const size = sizeLabelOf(file.size);
  if (file.status === 'uploading') {
    const meta = file.cancelling
      ? 'Cancelling'
      : file.fraction === null
        ? `Uploading · ${size}`
        : `Uploading ${shownPercent(file.fraction)}% · ${size}`;
    return {
      ...base,
      name: file.name,
      kind: 'run',
      meta,
      percent: file.fraction === null ? null : file.fraction * 100,
      action: file.sent || file.cancelling ? undefined : 'cancel',
    };
  }
  if (file.status === 'waiting') {
    const turn = input.progressSeen
      ? `Uploading 0% · ${size}`
      : `Uploading · ${size}`;
    return {
      ...base,
      name: file.name,
      kind: 'wait',
      meta: input.saving ? WAITING_FOR_SAVE : turn,
      percent: 0,
      action: 'cancel',
    };
  }
  if (file.status === 'done') {
    const saved = file.savedAs ?? file.name;
    return {
      ...base,
      name: saved,
      kind: file.taken ? 'flag' : 'ok',
      meta: file.taken
        ? takenNote(file.name, saved)
        : `Uploaded to ${folderLabelOf(file.folder)}`,
      percent: null,
    };
  }
  if (file.status === 'failed') {
    return {
      ...base,
      name: file.name,
      kind: 'fail',
      meta: file.reason ?? BRANCH_CHANGED,
      percent: null,
      action: file.recovery ?? 'remove',
    };
  }
  return {
    ...base,
    name: file.name,
    kind: 'off',
    meta: 'Cancelled',
    percent: null,
  };
};

const batchPercent = (files: readonly UploadFileState[]): number => {
  if (files.length === 0) return 0;
  const sum = files.reduce(
    (total, file) => total + (isLive(file) ? (file.fraction ?? 0) : 1),
    0
  );
  return Math.round((sum / files.length) * 100);
};

const atOf = (files: readonly UploadFileState[]): number =>
  Math.min(files.length, files.filter((file) => !isLive(file)).length + 1);

const headOf = (files: readonly UploadFileState[], saving: boolean): string => {
  const one = files.length === 1 ? files[0] : undefined;
  const live = files.filter(isLive);
  const failed = files.filter((file) => file.status === 'failed').length;
  const done = files.filter((file) => file.status === 'done');
  if (live.length > 0) {
    if (saving && live.every((file) => file.status === 'waiting')) {
      return WAITING_FOR_SAVE;
    }
    return `Uploading ${one ? one.name : filesWord(files.length)}`;
  }
  if (failed > 0) {
    return one
      ? `Couldn't upload ${one.name}`
      : `${failed} of ${filesWord(files.length)} couldn't upload`;
  }
  if (done.length > 0) {
    return `Uploaded ${one ? (one.savedAs ?? one.name) : filesWord(done.length)}`;
  }
  return one ? 'Upload cancelled' : 'Uploads cancelled';
};

const buttonOf = (input: UploadViewInput): UploadButtonLook => {
  const { files } = input;
  if (files.length === 0) return { mode: 'idle' };
  if (files.some(isLive)) {
    return {
      mode: 'run',
      words:
        files.length === 1
          ? 'Uploading'
          : `Uploading ${atOf(files)} of ${files.length}`,
      percent: batchPercent(files),
    };
  }
  const failed = files.filter((file) => file.status === 'failed').length;
  if (failed > 0) {
    return input.seen ? { mode: 'idle' } : { mode: 'failed', count: failed };
  }
  const done = files.filter((file) => file.status === 'done').length;
  if (done > 0 && input.settling) return { mode: 'done', count: done };
  return { mode: 'idle' };
};

/** The upload list as the Upload button, its popover and the Save progress widget read it. */
export const uploadViewOf = (input: UploadViewInput): UploadBatchView => {
  const { files } = input;
  const live = files.some(isLive);
  const failed = files.some((file) => file.status === 'failed');
  return {
    files: files.length,
    at: files.length === 0 ? 0 : atOf(files),
    progress: batchPercent(files),
    head: files.length === 0 ? '' : headOf(files, input.saving),
    tone: live ? 'run' : failed ? 'fail' : 'ok',
    rows: files.map((file) => rowOf(file, input)),
    button: buttonOf(input),
    mediaOpen: input.mediaOpen,
  };
};

/** What the polite status reads when everything listed has stopped. */
export const endSummaryOf = (files: readonly UploadFileState[]): string => {
  const done = files.filter((file) => file.status === 'done');
  const failed = files.filter((file) => file.status === 'failed');
  const taken = done.filter((file) => file.taken);
  const [onlyTaken] = taken;
  const takenWords =
    taken.length === 1 && onlyTaken
      ? ` ${takenNote(onlyTaken.name, onlyTaken.savedAs ?? onlyTaken.name)}.`
      : taken.length > 1
        ? ` ${taken.length} names were taken, so those files were saved with a number.`
        : '';
  if (failed.length > 0) {
    const [onlyFailed] = failed;
    const why =
      failed.length === 1 && onlyFailed
        ? `${onlyFailed.name} couldn't upload.`
        : `${filesWord(failed.length)} couldn't upload.`;
    const head =
      done.length > 0
        ? `Uploaded ${done.length} of ${filesWord(files.length)}. ${why}`
        : why;
    return head + takenWords;
  }
  const [onlyDone] = done;
  if (done.length === 1 && onlyDone) {
    return `${onlyDone.savedAs ?? onlyDone.name} uploaded to ${folderLabelOf(onlyDone.folder)}.${takenWords}`;
  }
  if (done.length > 0)
    return `Uploaded ${filesWord(done.length)}.${takenWords}`;
  return '';
};
