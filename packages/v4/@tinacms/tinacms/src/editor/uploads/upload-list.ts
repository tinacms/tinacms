import { type StoreApi, createStore } from 'zustand/vanilla';
import { authSliceOf } from '../../core/auth/slice';
import { currentBranchOf, protectedBranchOf } from '../../core/branch/contract';
import { MediaError, type MediaProvider } from '../../core/media/contract';
import type { SliceState, TinaStoreState } from '../../core/plugin';
import { useFormStore } from '../../form/form-store';
import { type ListChange, rekeyAddresses } from '../field-errors';
import { numberedName } from './upload-names';
import { type UploadFileState, endSummaryOf } from './upload-view';
import {
  BRANCH_CHANGED,
  CONNECTION_FAILURE,
  NO_ACCESS,
  NO_UPLOAD_PERMISSION,
  SESSION_EXPIRED,
  UNCONFIRMED,
  UPLOADS_AT_ONCE,
  UPLOAD_NAME_TRIES,
  UPLOAD_SETTLE_MS,
  filesWord,
  folderLabelOf,
  protectedBranchWords,
  takenNote,
} from './upload-words';

/** The mark on the open list, so the 5 second close waits while focus is inside it. */
export const UPLOAD_LIST_ATTR = 'data-upload-list';

/** Where files came from: the pane, one picker, or one image field of one form. */
export type UploadOrigin =
  | { kind: 'pane' }
  | { kind: 'picker'; id: string }
  | { kind: 'field'; form: object; address: string };

/** The image field a file fills when it lands. `form` is the form provider instance. */
export interface FieldTarget {
  form: object;
  address: string;
}

export interface UploadEntry extends UploadFileState {
  file: File;
  branch: string;
  path?: string;
  origin: UploadOrigin;
  field: FieldTarget | null;
  /** Lowercase name this entry holds in its folder, so two files of one batch never race for it. */
  claim: string | null;
  nameIndex: number;
  /** Null until 20 names were refused. Retry then goes on from the number after it. */
  lastRefused: number | null;
}

export interface UploadRequest {
  files: readonly File[];
  folder: string;
  origin: UploadOrigin;
  /** The checks before any bytes: why this file cannot upload, or null. */
  check: (file: File) => string | null;
  field?: FieldTarget;
}

export interface FieldNote extends FieldTarget {
  path: string;
  text: string;
}

export interface FreshFile {
  branch: string;
  folder: string;
  path: string;
}

export interface UploadListState {
  entries: UploadEntry[];
  seen: boolean;
  settling: boolean;
  progressSeen: boolean;
  /** What the polite status reads. Never a percentage. */
  say: string;
  /** The files that landed, for the New marks. */
  fresh: FreshFile[];
  /** Upload is locked for this branch and this user after a refused upload. */
  lock: { branch: string; who: string } | null;
  notes: FieldNote[];
  hosts: string[];
  mediaOpen: number;
}

export interface LandedFile {
  branch: string;
  folder: string;
  path: string;
  origin: UploadOrigin;
}

export interface UploadList {
  store: StoreApi<UploadListState>;
  /** Sends files to the list, or holds them when uploads cannot start now. */
  submit(request: UploadRequest): 'listed' | 'held';
  cancel(id: string): void;
  retry(id: string): void;
  remove(id: string): void;
  markSeen(): void;
  /** Why uploads cannot start now on this branch for this user, or null. */
  holdReason(): string | null;
  leaveFolder(folder: string): void;
  forgetFresh(paths: readonly string[]): void;
  onLanded(listener: (file: LandedFile) => void): () => void;
  /** Runs when a folder's listing may have changed: a file landed, or an upload could not be confirmed. */
  onStored(
    listener: (place: { branch: string; folder: string }) => void
  ): () => void;
  registerForm(
    form: object,
    write: (address: string, path: string) => void
  ): () => void;
  dropFieldTargets(form: object): void;
  rekeyFields(form: object, listAddress: string, change: ListChange): void;
  /** Takes the field's failed uploads out, and its taken-name note unless `keepNote`. */
  dismissField(target: FieldTarget, keepNote?: boolean): void;
  /** A `primary` host goes first, ahead of the hosts that fields and pickers render. */
  claimHost(id: string, primary?: boolean): () => void;
  markMediaOpen(): () => void;
}

const isLive = (entry: UploadEntry) =>
  entry.status === 'waiting' || entry.status === 'uploading';

const sameOrigin = (left: UploadOrigin, right: UploadOrigin): boolean => {
  if (left.kind === 'pane' || right.kind === 'pane') {
    return left.kind === right.kind;
  }
  if (left.kind === 'picker' && right.kind === 'picker') {
    return left.id === right.id;
  }
  if (left.kind === 'field' && right.kind === 'field') {
    return left.form === right.form && left.address === right.address;
  }
  return false;
};

export const isSameOrigin = sameOrigin;

const isAbort = (cause: unknown): boolean => {
  if (cause instanceof Error) {
    return cause.name === 'AbortError';
  } else {
    return false;
  }
};

const REMOVE_ONLY: ReadonlySet<string> = new Set([
  'too-large',
  'invalid-name',
  'invalid-path',
  'unsupported',
]);

const isSaving = (): boolean =>
  Object.values(useFormStore.getState().saves).some(
    (save) => save?.phase === 'saving'
  );

const isMediaSlice = (slice: SliceState): slice is SliceState & MediaProvider =>
  typeof slice.upload === 'function' &&
  typeof slice.list === 'function' &&
  typeof slice.delete === 'function' &&
  typeof slice.resolveUrl === 'function';

const mediaOf = (state: TinaStoreState): MediaProvider | null => {
  const slice = state.media;
  return slice && isMediaSlice(slice) ? slice : null;
};

const previewOf = (file: File): string | undefined => {
  if (!file.type.startsWith('image/')) return undefined;
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return undefined;
  }
  return URL.createObjectURL(file);
};

const dropPreview = (entry: UploadEntry) => {
  if (entry.preview && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(entry.preview);
  }
};

const createUploadList = (tina: StoreApi<TinaStoreState>): UploadList => {
  const store = createStore<UploadListState>(() => ({
    entries: [],
    seen: false,
    settling: false,
    progressSeen: false,
    say: '',
    fresh: [],
    lock: null,
    notes: [],
    hosts: [],
    mediaOpen: 0,
  }));
  const controllers = new Map<string, AbortController>();
  const writers = new Map<object, (address: string, path: string) => void>();
  const landedListeners = new Set<(file: LandedFile) => void>();
  const storedListeners = new Set<
    (place: { branch: string; folder: string }) => void
  >();
  const tellStored = (entry: UploadEntry) => {
    for (const listener of storedListeners) {
      listener({ branch: entry.branch, folder: entry.folder });
    }
  };
  let nextId = 0;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let stopSaveWatch: (() => void) | undefined;

  const liveBranch = (): string => currentBranchOf(tina.getState()) ?? '';
  const who = (): string => {
    const auth = authSliceOf(tina.getState());
    return `${auth?.status ?? 'none'}:${auth?.user?.id ?? ''}`;
  };
  const entryOf = (id: string) =>
    store.getState().entries.find((entry) => entry.id === id);
  const patch = (id: string, change: Partial<UploadEntry>) =>
    store.setState((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id ? { ...entry, ...change } : entry
      ),
    }));
  // What was read out since the last end summary, so the summary does not replace it.
  let said = '';
  const say = (words: string) => {
    said = words;
    store.setState({ say: words });
  };
  const sayEnd = (entries: readonly UploadEntry[]) => {
    const summary = endSummaryOf(entries);
    const words =
      summary !== '' && said.startsWith(summary)
        ? said
        : [said, summary].filter((part) => part !== '').join(' ');
    said = '';
    store.setState({ say: words });
  };

  const lockHolds = (): boolean => {
    const { lock } = store.getState();
    return lock !== null && lock.branch === liveBranch() && lock.who === who();
  };

  const nextFreeIndex = (entry: UploadEntry, from: number): number => {
    const held = new Set(
      store
        .getState()
        .entries.filter(
          (other) =>
            other.id !== entry.id &&
            other.claim !== null &&
            other.branch === entry.branch &&
            other.folder === entry.folder
        )
        .map((other) => other.claim)
    );
    let index = from;
    while (held.has(numberedName(entry.name, index).toLowerCase())) index += 1;
    return index;
  };

  const clearSettle = () => {
    if (settleTimer !== undefined) clearTimeout(settleTimer);
    settleTimer = undefined;
  };

  const emptyStopped = () => {
    settleTimer = undefined;
    const focused =
      typeof document === 'undefined' ? null : document.activeElement;
    if (focused?.closest(`[${UPLOAD_LIST_ATTR}]`)) {
      settleTimer = setTimeout(emptyStopped, UPLOAD_SETTLE_MS);
      return;
    }
    store.setState((state) => {
      for (const entry of state.entries) {
        if (!isLive(entry)) dropPreview(entry);
      }
      return { entries: state.entries.filter(isLive), settling: false };
    });
  };

  const watchSaves = () => {
    const waits = store
      .getState()
      .entries.some((entry) => entry.status === 'waiting');
    if (waits && !stopSaveWatch) {
      stopSaveWatch = useFormStore.subscribe(() => pump());
    } else if (!waits && stopSaveWatch) {
      stopSaveWatch();
      stopSaveWatch = undefined;
    }
  };

  // Reads the end out once, then empties a list with no failure after 5 seconds.
  const settle = () => {
    const { entries, settling } = store.getState();
    if (entries.length === 0 || entries.some(isLive)) return;
    if (entries.some((entry) => entry.status === 'failed')) {
      if (!settling) return;
      store.setState({ settling: false });
      clearSettle();
      return;
    }
    if (settling) return;
    store.setState({ settling: true });
    sayEnd(entries);
    clearSettle();
    settleTimer = setTimeout(emptyStopped, UPLOAD_SETTLE_MS);
  };

  const announceEnd = () => {
    const { entries } = store.getState();
    if (entries.length === 0 || entries.some(isLive)) return;
    if (entries.some((entry) => entry.status === 'failed')) sayEnd(entries);
  };

  const failEntry = (
    id: string,
    reason: string,
    recovery: 'retry' | 'remove'
  ) => {
    const entry = entryOf(id);
    if (!entry) return;
    patch(id, {
      status: 'failed',
      reason,
      recovery,
      claim: null,
      cancelling: false,
    });
    store.setState({ seen: false });
    say(`${entry.name} couldn't upload. ${reason}`);
  };

  const refuse = (entry: UploadEntry) => {
    const auth = authSliceOf(tina.getState());
    if (auth === null || auth.status === 'signed-in') {
      store.setState((state) => ({
        lock: { branch: entry.branch, who: who() },
        seen: false,
        entries: state.entries.map((other) =>
          other.id === entry.id ||
          (other.status === 'waiting' && other.branch === entry.branch)
            ? {
                ...other,
                status: 'failed',
                reason: NO_UPLOAD_PERMISSION,
                recovery: 'remove',
                claim: null,
                cancelling: false,
              }
            : other
        ),
      }));
      say(`${entry.name} couldn't upload. ${NO_UPLOAD_PERMISSION}`);
    } else if (auth.status === 'forbidden') {
      failEntry(entry.id, NO_ACCESS, 'remove');
    } else {
      failEntry(entry.id, SESSION_EXPIRED, 'remove');
    }
  };

  const fail = (entry: UploadEntry, cause: unknown) => {
    if (cause instanceof MediaError) {
      if (cause.code === 'unauthorized') {
        refuse(entry);
      } else {
        failEntry(
          entry.id,
          cause.message,
          REMOVE_ONLY.has(cause.code) ? 'remove' : 'retry'
        );
      }
    } else {
      failEntry(entry.id, CONNECTION_FAILURE, 'retry');
    }
  };

  const land = (entry: UploadEntry, path: string, numbered: boolean) => {
    const savedAs = path.split('/').at(-1) ?? path;
    const text = takenNote(entry.name, savedAs);
    // A file that lands after the branch changed fills no field.
    const { field } =
      liveBranch() === entry.branch
        ? (entryOf(entry.id) ?? entry)
        : { field: null };
    store.setState((state) => ({
      entries: state.entries.map((other) =>
        other.id === entry.id
          ? {
              ...other,
              status: 'done',
              fraction: 1,
              sent: true,
              cancelling: false,
              path,
              savedAs,
              taken: numbered,
            }
          : other
      ),
      fresh: [
        { branch: entry.branch, folder: entry.folder, path },
        ...state.fresh.filter(
          (file) => !(file.branch === entry.branch && file.path === path)
        ),
      ],
      notes: field
        ? [
            ...state.notes.filter(
              (note) =>
                !(note.form === field.form && note.address === field.address)
            ),
            ...(numbered ? [{ ...field, path, text }] : []),
          ]
        : state.notes,
    }));
    if (field) writers.get(field.form)?.(field.address, path);
    for (const listener of landedListeners) {
      listener({
        branch: entry.branch,
        folder: entry.folder,
        path,
        origin: entry.origin,
      });
    }
    tellStored(entry);
  };

  const run = async (id: string) => {
    const controller = new AbortController();
    controllers.set(id, controller);
    patch(id, { status: 'uploading', fraction: null, sent: false });
    let refusals = 0;
    try {
      for (;;) {
        const entry = entryOf(id);
        if (!entry) return;
        if (entry.cancelling) {
          patch(id, { status: 'cancelled', claim: null, cancelling: false });
          return;
        }
        if (liveBranch() !== entry.branch) {
          patch(id, {
            status: 'failed',
            reason: BRANCH_CHANGED,
            recovery: 'remove',
            claim: null,
          });
          return;
        }
        const media = mediaOf(tina.getState());
        if (!media) {
          failEntry(id, CONNECTION_FAILURE, 'retry');
          return;
        }
        const candidate = numberedName(entry.name, entry.nameIndex);
        const file =
          entry.nameIndex === 0
            ? entry.file
            : new File([entry.file], candidate, {
                type: entry.file.type,
                lastModified: entry.file.lastModified,
              });
        try {
          const path = await media.upload(file, entry.folder, {
            signal: controller.signal,
            onProgress: (fraction) => {
              if (entryOf(id)?.status !== 'uploading') return;
              const bounded = Math.min(1, Math.max(0, fraction));
              patch(id, { fraction: bounded, sent: bounded >= 1 });
              if (!store.getState().progressSeen) {
                store.setState({ progressSeen: true });
              }
            },
          });
          land(entry, path, entry.nameIndex > 0);
          return;
        } catch (cause) {
          const now = entryOf(id);
          if (!now) return;
          // No answer from the storage after every byte was sent: the file may be stored.
          // This goes before the Cancel check, so such a file never reads "Cancelled".
          if (now.sent && !(cause instanceof MediaError) && !isAbort(cause)) {
            failEntry(id, UNCONFIRMED, 'remove');
            tellStored(now);
            return;
          }
          if (now.cancelling || isAbort(cause)) {
            patch(id, { status: 'cancelled', claim: null, cancelling: false });
            say(`Cancelled uploading ${now.name}.`);
            return;
          }
          if (cause instanceof MediaError && cause.code === 'name-taken') {
            refusals += 1;
            if (refusals >= UPLOAD_NAME_TRIES) {
              failEntry(id, cause.message, 'retry');
              patch(id, { lastRefused: now.nameIndex });
              return;
            }
            if (now.lastRefused !== null) {
              patch(id, { lastRefused: now.nameIndex });
            }
            const nameIndex = nextFreeIndex(now, now.nameIndex + 1);
            patch(id, {
              nameIndex,
              claim: numberedName(now.name, nameIndex).toLowerCase(),
              fraction: null,
              sent: false,
            });
            continue;
          }
          fail(now, cause);
          return;
        }
      }
    } finally {
      controllers.delete(id);
      announceEnd();
      settle();
      pump();
    }
  };

  function pump() {
    watchSaves();
    if (isSaving()) return;
    for (;;) {
      const { entries } = store.getState();
      const active = entries.filter(
        (entry) => entry.status === 'uploading'
      ).length;
      if (active >= UPLOADS_AT_ONCE) return;
      const waiting = entries.filter((entry) => entry.status === 'waiting');
      const next = waiting.find((entry) => entry.field !== null) ?? waiting[0];
      if (!next) {
        watchSaves();
        return;
      }
      void run(next.id);
    }
  }

  const add = (request: UploadRequest, branch: string) => {
    clearSettle();
    const added: UploadEntry[] = [];
    const refused: string[] = [];
    store.setState((state) => {
      const kept = state.entries.filter(
        (entry) => entry.status !== 'done' && entry.status !== 'cancelled'
      );
      for (const entry of state.entries) {
        if (!kept.includes(entry)) dropPreview(entry);
      }
      return { entries: kept, settling: false };
    });
    for (const file of request.files) {
      nextId += 1;
      const reason = request.check(file);
      const entry: UploadEntry = {
        id: `upload-${nextId}`,
        file,
        name: file.name,
        size: file.size,
        folder: request.folder,
        branch,
        status: reason === null ? 'waiting' : 'failed',
        fraction: null,
        sent: false,
        cancelling: false,
        taken: false,
        reason: reason ?? undefined,
        recovery: reason === null ? undefined : 'remove',
        preview: previewOf(file),
        origin: request.origin,
        field:
          request.field && writers.has(request.field.form)
            ? request.field
            : null,
        claim: null,
        nameIndex: 0,
        lastRefused: null,
      };
      if (reason === null) {
        entry.nameIndex = nextFreeIndex(entry, 0);
        entry.claim = numberedName(entry.name, entry.nameIndex).toLowerCase();
      } else {
        refused.push(`${file.name} couldn't upload. ${reason}`);
      }
      store.setState((state) => ({ entries: [...state.entries, entry] }));
      added.push(entry);
    }
    const { field } = request;
    if (field) {
      store.setState((state) => ({
        notes: state.notes.filter(
          (note) =>
            !(note.form === field.form && note.address === field.address)
        ),
      }));
    }
    const going = added.filter((entry) => entry.status === 'waiting');
    const [only] = going;
    const where = folderLabelOf(request.folder);
    const start =
      going.length === 1 && only
        ? `Uploading ${only.name} to ${where}.`
        : going.length > 1
          ? `Uploading ${filesWord(going.length)} to ${where}.`
          : '';
    if (refused.length > 0) store.setState({ seen: false });
    said = '';
    store.setState({
      say: [start, ...refused].filter((words) => words !== '').join(' '),
    });
    pump();
    settle();
  };

  const submit: UploadList['submit'] = (request) => {
    if (request.files.length === 0) return 'held';
    if (isSaving() || lockHolds() || protectedBranchOf(tina.getState())) {
      return 'held';
    }
    add(request, liveBranch());
    return 'listed';
  };

  tina.subscribe((state, previous) => {
    const branch = currentBranchOf(state) ?? '';
    if (branch === (currentBranchOf(previous) ?? '')) return;
    store.setState((current) => ({
      entries: current.entries.map((entry) => {
        if (entry.branch === branch) return entry;
        if (entry.status === 'waiting' || entry.status === 'failed') {
          return {
            ...entry,
            status: 'failed',
            reason: BRANCH_CHANGED,
            recovery: 'remove',
            claim: null,
            field: null,
          };
        }
        return { ...entry, field: null };
      }),
    }));
    watchSaves();
    settle();
  });

  return {
    store,
    submit,
    cancel: (id) => {
      const entry = entryOf(id);
      if (!entry) return;
      if (entry.status === 'waiting') {
        patch(id, { status: 'cancelled', claim: null });
        say(`Cancelled uploading ${entry.name}.`);
        watchSaves();
        settle();
      } else if (entry.status === 'uploading' && !entry.sent) {
        patch(id, { cancelling: true });
        controllers.get(id)?.abort();
      }
    },
    retry: (id) => {
      const entry = entryOf(id);
      if (entry?.status !== 'failed' || entry.recovery !== 'retry') return;
      if (entry.branch !== liveBranch()) {
        patch(id, { reason: BRANCH_CHANGED, recovery: 'remove' });
        return;
      }
      clearSettle();
      const nameIndex = nextFreeIndex(
        entry,
        entry.lastRefused === null ? 0 : entry.lastRefused + 1
      );
      patch(id, {
        status: 'waiting',
        reason: undefined,
        recovery: undefined,
        fraction: null,
        sent: false,
        taken: false,
        nameIndex,
        claim: numberedName(entry.name, nameIndex).toLowerCase(),
      });
      store.setState({ settling: false });
      pump();
    },
    remove: (id) => {
      const entry = entryOf(id);
      if (!entry || isLive(entry)) return;
      dropPreview(entry);
      store.setState((state) => ({
        entries: state.entries.filter((other) => other.id !== id),
      }));
      settle();
    },
    markSeen: () => {
      if (!store.getState().seen) store.setState({ seen: true });
    },
    holdReason: () => {
      const protectedName = protectedBranchOf(tina.getState());
      if (protectedName !== undefined)
        return protectedBranchWords(protectedName);
      return lockHolds() ? NO_UPLOAD_PERMISSION : null;
    },
    leaveFolder: (folder) =>
      store.setState((state) => ({
        fresh: state.fresh.filter((file) => file.folder !== folder),
      })),
    forgetFresh: (paths) =>
      store.setState((state) => ({
        fresh: state.fresh.filter((file) => !paths.includes(file.path)),
      })),
    onStored: (listener) => {
      storedListeners.add(listener);
      return () => storedListeners.delete(listener);
    },
    onLanded: (listener) => {
      landedListeners.add(listener);
      return () => landedListeners.delete(listener);
    },
    registerForm: (form, write) => {
      writers.set(form, write);
      return () => {
        writers.delete(form);
        store.setState((state) => ({
          entries: state.entries.map((entry) =>
            entry.field?.form === form ? { ...entry, field: null } : entry
          ),
          notes: state.notes.filter((note) => note.form !== form),
        }));
      };
    },
    dropFieldTargets: (form) =>
      store.setState((state) => ({
        entries: state.entries.map((entry) =>
          entry.field?.form === form ? { ...entry, field: null } : entry
        ),
        notes: state.notes.filter((note) => note.form !== form),
      })),
    rekeyFields: (form, listAddress, change) => {
      const moved = (address: string): string | undefined =>
        rekeyAddresses([address], listAddress, change)[0];
      store.setState((state) => ({
        entries: state.entries.map((entry) => {
          if (entry.field?.form !== form) return entry;
          const address = moved(entry.field.address);
          return {
            ...entry,
            field: address === undefined ? null : { form, address },
          };
        }),
        notes: state.notes.flatMap((note) => {
          if (note.form !== form) return [note];
          const address = moved(note.address);
          return address === undefined ? [] : [{ ...note, address }];
        }),
      }));
    },
    dismissField: (target, keepNote = false) => {
      const stale = store
        .getState()
        .entries.filter(
          (entry) =>
            entry.status === 'failed' &&
            entry.field?.form === target.form &&
            entry.field.address === target.address
        );
      for (const entry of stale) dropPreview(entry);
      store.setState((state) => ({
        entries: state.entries.filter((entry) => !stale.includes(entry)),
        notes: keepNote
          ? state.notes
          : state.notes.filter(
              (note) =>
                !(note.form === target.form && note.address === target.address)
            ),
      }));
      settle();
    },
    claimHost: (id, primary = false) => {
      store.setState((state) => ({
        hosts: primary ? [id, ...state.hosts] : [...state.hosts, id],
      }));
      return () =>
        store.setState((state) => ({
          hosts: state.hosts.filter((host) => host !== id),
        }));
    },
    markMediaOpen: () => {
      store.setState((state) => ({ mediaOpen: state.mediaOpen + 1 }));
      return () =>
        store.setState((state) => ({ mediaOpen: state.mediaOpen - 1 }));
    },
  };
};

const lists = new WeakMap<StoreApi<TinaStoreState>, UploadList>();

/** The one upload list of a `TinaProvider` runtime (ADR-003), made on first use. */
export const uploadListOf = (tina: StoreApi<TinaStoreState>): UploadList => {
  const existing = lists.get(tina);
  if (existing) return existing;
  const created = createUploadList(tina);
  lists.set(tina, created);
  return created;
};
