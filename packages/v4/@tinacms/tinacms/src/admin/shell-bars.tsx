import {
  BranchSwitcher,
  LocalFilesBadge,
  failureDetail,
} from '@tinacms/ui/components/branch-switcher';
import { canRetry, type CreateFailure } from '@tinacms/ui/lib/create-failure';
import { SaveProgress } from '@tinacms/ui/components/save-progress';
import { SidebarTrigger } from '@tinacms/ui/components/sidebar';
import { StatusBar } from '@tinacms/ui/components/status-bar';
import { TopBar } from '@tinacms/ui/components/top-bar';
import tinaLogo from '@tinacms/ui/assets/tinacms-logo.svg';
import tinaMark from '@tinacms/ui/assets/tinacms-mark.svg';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { toast } from '@tinacms/ui/components/toast';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import {
  readAnyFormDirty,
  readSaveRunning,
  useAnyFormDirty,
  useSaveRunning,
  useSaveSummary,
} from '../form/form-store';
import { TinaRuntimeContext } from '../editor/context';
import { useBranchEntries } from './use-branch-entries';
import { useBranchView } from '../editor/branch';
import { AccountMenu } from './account-menu';
import { SaveAllControl } from './save-all';
import { shortStatusWords, statusWords } from './status-words';
import { SearchControl } from './search';
import { useOptionalContentSlice } from '../editor/hooks';

// A save shorter than this finishes before the card would flash.
const SAVE_PROGRESS_DELAY_MS = 1000;

/** True once a save has run for longer than the delay. */
export function useLongSave(): boolean {
  const saving = useSaveSummary().state === 'saving';
  const [long, setLong] = useState(false);
  useEffect(() => {
    if (!saving) {
      setLong(false);
      return;
    }
    const timer = setTimeout(() => setLong(true), SAVE_PROGRESS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [saving]);
  return long;
}

type CreateRequest = { name: string; from: string };

type Outcome =
  | {
      kind: 'failed';
      name: string;
      from: string;
      failure?: CreateFailure;
    }
  | { kind: 'unready'; name: string }
  | { kind: 'ready'; name: string };

const DIRTY_REASON = 'Save or discard your changes first';
const SAVING_REASON = 'Wait for the save to finish.';
const waitsOnCreate = (message: string) =>
  message.startsWith('Wait for ') && message !== SAVING_REASON;

/** Why no branch action may run now: unsaved edits, or a save still running (its afterSave included). */
const blockedReason = (): string | undefined => {
  if (readSaveRunning()) return SAVING_REASON;
  if (readAnyFormDirty()) return DIRTY_REASON;
  return undefined;
};

const sameOutcome = (a: Outcome, b: Outcome): boolean =>
  a.kind === b.kind &&
  a.name === b.name &&
  (a.kind !== 'failed' ||
    (b.kind === 'failed' && a.from === b.from && a.failure === b.failure));

/**
 * The branch button. Owns whether the switcher is open and what the last create ended in. While
 * the switcher is open that outcome shows as a note inside it; a toast is sent only once the
 * switcher closes with the outcome still unhandled, and reopening takes the toast back.
 */
function BranchControl() {
  const runtime = use(TinaRuntimeContext);
  const branch = useBranchView();
  const saving = useSaveRunning();
  const dirty = useAnyFormDirty();
  const [open, setOpen] = useState(false);
  const [held, setHeld] = useState<Outcome>();
  // The held failure while it still shows in the New branch form, not as the note.
  const [inline, setInline] = useState<Outcome>();
  const [reason, setReason] = useState<string>();
  const [formShown, setFormShown] = useState(false);
  const [formTyped, setFormTyped] = useState('');
  const [deferred, setDeferred] = useState<Outcome>();
  // Counts the creates that ended ready or unready under the name the form holds: each resets it.
  const [formReset, setFormReset] = useState(0);
  const released = useRef<Outcome>(undefined);
  // The create the shell started, until its result arrives. A direct slice call leaves it empty.
  const started = useRef<{ via: 'form' | 'note'; name: string }>(undefined);
  // A ready create whose auto-switch waits for the running save to end.
  const switchAfterSave = useRef<{ outcome: Outcome; startedOn?: string }>(
    undefined
  );
  const entries = useBranchEntries(branch, open);

  const create = branch?.create;
  const latest = useRef<{
    branch: typeof branch;
    open: boolean;
    formShown: boolean;
    formTyped: string;
    startCreate: (request: CreateRequest, via?: 'form' | 'note') => boolean;
  }>({
    branch,
    open,
    formShown,
    formTyped,
    startCreate: () => false,
  });
  const startCreate = (
    request: CreateRequest,
    via: 'form' | 'note' = 'form'
  ): boolean => {
    if (!create) return false;
    const blocked = blockedReason();
    if (blocked) {
      refuse(blocked);
      return false;
    }
    const running = latest.current.branch?.creating;
    if (running) {
      refuse(`Wait for ${running.name} to finish first`);
      return false;
    }
    setHeld(undefined);
    setReason(undefined);
    started.current = { via, name: request.name };
    create?.(request.name, request.from);
    return true;
  };

  const refusalToasts = useRef(new Map<string, string>());
  // An open switcher already shows the dirty or saving reason as its blocked line.
  const refuse = (message: string) => {
    if (!latest.current.open) refusalToast(message);
    else if (message !== DIRTY_REASON && message !== SAVING_REASON) {
      setReason(message);
    }
  };
  // One id per kind of refusal, so a message that changes (a renamed create) replaces its toast.
  const refusalToast = (message: string) => {
    const id = waitsOnCreate(message) ? 'refused:wait' : `refused:${message}`;
    refusalToasts.current.set(id, message);
    toast({ id, tone: 'warning', title: message });
  };
  const clearRefusals = (only?: (message: string) => boolean) => {
    for (const [id, message] of [...refusalToasts.current]) {
      if (only && !only(message)) continue;
      toast.dismiss(id);
      refusalToasts.current.delete(id);
    }
    setReason((shown) =>
      shown !== undefined && (!only || only(shown)) ? undefined : shown
    );
  };

  const switchTo = (name: string): boolean => {
    const blocked = blockedReason();
    if (blocked) {
      refuse(blocked);
      return false;
    }
    latest.current.branch?.switchTo(name);
    return true;
  };

  useEffect(() => {
    clearRefusals();
  }, [open]);
  useEffect(() => {
    if (!dirty) clearRefusals((message) => message === DIRTY_REASON);
  }, [dirty]);
  useEffect(() => {
    if (saving) return;
    clearRefusals((message) => message === SAVING_REASON);
    const waiting = switchAfterSave.current;
    switchAfterSave.current = undefined;
    const view = latest.current.branch;
    if (
      !waiting ||
      waiting.outcome !== held ||
      !view ||
      view.name !== waiting.startedOn ||
      blockedReason()
    ) {
      return;
    }
    setHeld(undefined);
    view.switchTo(waiting.outcome.name);
    setOpen(false);
  }, [saving]);
  const running = branch?.creating?.name;
  useEffect(() => {
    if (running === undefined) clearRefusals(waitsOnCreate);
  }, [running]);

  const currentName = branch?.name;
  useEffect(() => {
    setHeld((note) =>
      note?.kind === 'ready' && note.name === currentName ? undefined : note
    );
  }, [currentName, held]);

  const result = branch?.createResult;
  latest.current = {
    branch,
    open,
    formShown,
    formTyped,
    startCreate,
  };
  useEffect(() => {
    if (!result) return;
    const origin = started.current;
    started.current = undefined;
    const settle = () => {
      const { branch: view, open: isOpen } = latest.current;
      const { formShown: shown, formTyped: typed } = latest.current;
      if (!view) return;
      const { name, from, startedOn: began, outcome, failure } = result;
      setReason(undefined);
      if (outcome === 'failed') {
        setDeferred(undefined);
        const failed: Outcome = { kind: 'failed', name, from, failure };
        setHeld(failed);
        setInline(
          origin?.via === 'form' && isOpen && shown ? failed : undefined
        );
        return;
      }
      const owned =
        origin?.via === 'form' ||
        (typed !== '' && (typed === origin?.name || typed === name));
      if (owned) setFormReset((count) => count + 1);
      if (isOpen && shown && typed !== '' && !owned) {
        setDeferred({ kind: outcome, name });
        return;
      }
      setDeferred(undefined);
      const startedOn = began ?? view.defaultBranch;
      if (outcome === 'ready' && isOpen && view.name === startedOn) {
        const blocked = blockedReason();
        if (!blocked) {
          setHeld(undefined);
          view.switchTo(name);
          setOpen(false);
          return;
        }
        if (blocked === SAVING_REASON) {
          const ready: Outcome = { kind: 'ready', name };
          switchAfterSave.current = { outcome: ready, startedOn };
          setHeld(ready);
          return;
        }
      }
      setHeld({ kind: outcome, name });
    };
    settle();
    // Cleared last, so the render that drops the result also carries the state set above.
    runtime?.store.setState((state) => ({
      branch: { ...state.branch, createResult: undefined },
    }));
  }, [result, runtime]);

  useEffect(() => {
    if (deferred && !(open && formShown && formTyped !== '')) {
      if (open && formShown) released.current = deferred;
      setHeld(deferred);
      setDeferred(undefined);
    }
  }, [deferred, open, formShown, formTyped]);

  const demoteInline = () => setInline(undefined);
  // Every way a person ends an outcome: the note's or toast's Dismiss, or a swipe. Auto-close does not (F4).
  const endOutcome = (ended: Outcome) => {
    setHeld((now) => (now === ended ? undefined : now));
    setReason(undefined);
  };
  useEffect(() => {
    if (open) return;
    demoteInline();
    switchAfterSave.current = undefined;
  }, [open]);

  const outcome = useMemo<Outcome | undefined>(() => {
    return held?.kind === 'ready' && held.name === currentName
      ? undefined
      : held;
  }, [held, currentName]);

  const handle = (): boolean | void => {
    if (!outcome) return;
    if (outcome.kind === 'failed') {
      return startCreate({ name: outcome.name, from: outcome.from }, 'note');
    }
    if (outcome.kind === 'ready') {
      const switched = switchTo(outcome.name);
      if (switched) {
        setHeld(undefined);
        setOpen(false);
      }
      return switched;
    }
  };

  const sent = useRef<{ outcome: Outcome; id: string | number }>(undefined);
  useEffect(() => {
    if (open || !outcome) {
      if (sent.current) toast.dismiss(sent.current.id);
      sent.current = undefined;
      return;
    }
    if (sent.current && sameOutcome(sent.current.outcome, outcome)) return;
    if (sent.current) toast.dismiss(sent.current.id);
    const act = (id: () => string | number, run: () => boolean | void) => {
      let accepted = false;
      return () => {
        if (accepted) return;
        if (run() === false) return;
        accepted = true;
        toast.dismiss(id());
        clearRefusals();
      };
    };
    let id: string | number = '';
    const idOf = () => id;
    const onEnd = () => endOutcome(outcome);
    if (outcome.kind === 'failed') {
      id = toast({
        tone: 'error',
        onEnd,
        title: `Couldn't create ${outcome.name}`,
        text: failureDetail(outcome.name, outcome.failure),
        action: !canRetry(outcome.failure)
          ? undefined
          : {
              label: 'Retry',
              onClick: act(idOf, () =>
                latest.current.startCreate(
                  { name: outcome.name, from: outcome.from },
                  'note'
                )
              ),
            },
      });
    } else if (outcome.kind === 'unready') {
      id = toast({
        tone: 'warning',
        onEnd,
        title: `${outcome.name} isn't ready yet`,
        text: 'It was made. You can switch to it after reloading the page.',
      });
    } else {
      id = toast({
        tone: 'success',
        onEnd,
        title: `${outcome.name} is ready`,
        action: {
          label: `Switch to ${outcome.name}`,
          onClick: act(idOf, () => {
            const blocked = blockedReason();
            if (blocked) {
              refusalToast(blocked);
              return false;
            }
            latest.current.branch?.switchTo(outcome.name);
            setHeld(undefined);
          }),
        },
      });
    }
    sent.current = { outcome, id };
  }, [open, outcome]);

  if (branch?.mode === 'local') return <LocalFilesBadge />;
  if (branch?.mode !== 'branches') return null;
  const loading = branch.listState === 'loading';
  if (!branch.name && !loading && branch.listState !== 'failed') return null;
  return (
    <BranchSwitcher
      current={branch.name}
      status={branch.listState ?? 'ready'}
      onRetry={branch.retryList}
      branches={entries}
      disabled={saving}
      blockedMessage={saving ? SAVING_REASON : dirty ? DIRTY_REASON : undefined}
      onSwitch={switchTo}
      open={open}
      onOpenChange={setOpen}
      onFormChange={(shown, typed) => {
        setFormShown(shown);
        setFormTyped(typed);
        if (!shown) demoteInline();
      }}
      note={
        held
          ? { ...held, reason, keepForm: held === released.current }
          : undefined
      }
      onNoteAction={handle}
      onNoteDismiss={() => {
        if (held) endOutcome(held);
      }}
      createFailure={held?.kind === 'failed' ? held.failure : undefined}
      formResetKey={formReset}
      creatingBranch={branch.creating?.name}
      baseBranch={branch.defaultBranch}
      onCreate={
        create ? (name, from) => startCreate({ name, from }) : undefined
      }
      createState={
        (branch.creating || result) && started.current?.via === 'form'
          ? 'creating'
          : held?.kind === 'failed' && held === inline
            ? 'failed'
            : 'idle'
      }
    />
  );
}

export function ShellTopBar({ projectName }: { projectName?: string }) {
  const content = useOptionalContentSlice();
  const phone = useTier() === 'phone';
  return (
    <TopBar
      toggle={<SidebarTrigger />}
      logo={
        phone ? undefined : (
          <img src={tinaLogo} alt='TinaCMS' className='h-5 w-auto flex-none' />
        )
      }
      mark={
        phone ? (
          <img src={tinaMark} alt='TinaCMS' className='h-5 w-auto flex-none' />
        ) : undefined
      }
      projectName={projectName}
      branch={<BranchControl />}
      search={<SearchControl />}
      save={content ? <SaveAllControl /> : undefined}
      account={<AccountMenu />}
    />
  );
}

export function ShellStatusBar() {
  const branch = useBranchView();
  const summary = useSaveSummary();
  // Kept edits draw the unsaved dot while the save state stays idle.
  const state =
    summary.state === 'idle' && summary.kept ? 'unsaved' : summary.state;
  const phone = useTier() === 'phone';
  const local = branch?.mode === 'local';
  const words = phone
    ? shortStatusWords(summary, local)
    : statusWords(summary, local);
  if (local) {
    return (
      <StatusBar local state={state}>
        {words}
      </StatusBar>
    );
  }
  if (branch?.mode === 'branches' && branch.name) {
    const isProtected = branch.branches.some(
      (entry) => entry.name === branch.name && entry.protected
    );
    return (
      <StatusBar
        branch={branch.name}
        protectedBranch={isProtected}
        state={state}
      >
        {words}
      </StatusBar>
    );
  }
  return <StatusBar state={state}>{words}</StatusBar>;
}

export function ShellSaveProgress() {
  return useLongSave() ? <SaveProgress /> : null;
}
