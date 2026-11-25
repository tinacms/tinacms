import {
  type CreateFailure,
  BranchSwitcher,
  LocalFilesBadge,
  canRetry,
  failureDetail,
} from '@tinacms/ui/components/branch-switcher';
import { SaveProgress } from '@tinacms/ui/components/save-progress';
import { SidebarTrigger } from '@tinacms/ui/components/sidebar';
import { StatusBar } from '@tinacms/ui/components/status-bar';
import { TopBar } from '@tinacms/ui/components/top-bar';
import tinaLogo from '@tinacms/ui/assets/tinacms-logo.svg';
import { toast } from '@tinacms/ui/components/toast';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import {
  readAnyFormDirty,
  useAnyFormDirty,
  useSaveSummary,
} from '../form/form-store';
import { TinaRuntimeContext } from '../editor/context';
import { useBranchEntries } from './use-branch-entries';
import { useBranchView } from '../editor/branch';
import { AccountMenu } from './account-menu';
import { SaveAllControl } from './save-all';
import { statusWords } from './status-words';
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
      viaForm?: boolean;
      failure?: CreateFailure;
    }
  | { kind: 'unready'; name: string }
  | { kind: 'ready'; name: string };

const DIRTY_REASON = 'Save or discard your changes first';

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
  const saving = useSaveSummary().state === 'saving';
  const dirty = useAnyFormDirty();
  const [open, setOpen] = useState(false);
  const [held, setHeld] = useState<Outcome>();
  const [reason, setReason] = useState<string>();
  const [formShown, setFormShown] = useState(false);
  const [formTyped, setFormTyped] = useState('');
  const [deferred, setDeferred] = useState<Outcome>();
  // Counts the creates that ended ready or unready under the name the form holds: each resets it.
  const [formReset, setFormReset] = useState(0);
  const released = useRef<Outcome>(undefined);
  // The create the shell started, until its result arrives. A direct slice call leaves it empty.
  const started = useRef<{ via: 'form' | 'note'; name: string }>(undefined);
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
    if (readAnyFormDirty()) {
      refuse(DIRTY_REASON);
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

  // A refused action says why inside the switcher while it is open, else in a toast.
  const refusalToasts = useRef(new Set<string>());
  const refuse = (message: string) => {
    if (latest.current.open) setReason(message);
    else refusalToast(message);
  };
  const refusalToast = (message: string) => {
    const id = `refused:${message}`;
    refusalToasts.current.add(id);
    toast({ id, tone: 'warning', title: message });
  };
  // A refusal goes once its cause is gone: `only` limits it to one kind of message.
  const clearRefusals = (only?: (message: string) => boolean) => {
    for (const id of [...refusalToasts.current]) {
      if (only && !only(id.slice('refused:'.length))) continue;
      toast.dismiss(id);
      refusalToasts.current.delete(id);
    }
    setReason((shown) =>
      shown !== undefined && (!only || only(shown)) ? undefined : shown
    );
  };

  const switchTo = (name: string): boolean => {
    if (readAnyFormDirty()) {
      refuse(DIRTY_REASON);
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
  const running = branch?.creating?.name;
  useEffect(() => {
    if (running === undefined) {
      clearRefusals((message) => message.startsWith('Wait for '));
    }
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
        const inline = origin?.via === 'form' && isOpen && shown;
        setHeld({
          kind: 'failed',
          name,
          from,
          viaForm: inline,
          failure,
        });
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
      if (
        outcome === 'ready' &&
        isOpen &&
        view.name === startedOn &&
        !readAnyFormDirty()
      ) {
        setHeld(undefined);
        view.switchTo(name);
        setOpen(false);
        return;
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

  // An inline form failure becomes the note once the switcher closes or the form goes.
  const demoteInline = () =>
    setHeld((note) =>
      note?.kind === 'failed' && note.viaForm
        ? { ...note, viaForm: false }
        : note
    );
  useEffect(() => {
    if (!open) demoteInline();
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

  // The toast stands in for the note while the switcher is closed.
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
    if (outcome.kind === 'failed') {
      id = toast({
        tone: 'error',
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
        title: `${outcome.name} isn't ready yet`,
        text: 'It was made. You can switch to it after reloading the page.',
      });
    } else {
      id = toast({
        tone: 'success',
        title: `${outcome.name} is ready`,
        action: {
          label: `Switch to ${outcome.name}`,
          onClick: act(idOf, () => {
            if (readAnyFormDirty()) {
              refusalToast(DIRTY_REASON);
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
      blockedMessage={dirty ? 'Save or discard your changes first' : undefined}
      onSwitch={branch.switchTo}
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
        setHeld(undefined);
        setReason(undefined);
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
          : held?.kind === 'failed' && held.viaForm
            ? 'failed'
            : 'idle'
      }
    />
  );
}

export function ShellTopBar({ projectName }: { projectName?: string }) {
  const content = useOptionalContentSlice();
  return (
    <TopBar
      toggle={<SidebarTrigger />}
      logo={
        <img
          src={tinaLogo}
          alt='TinaCMS'
          className='h-5 w-auto flex-none max-[399px]:hidden'
        />
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
  const words = statusWords(summary, branch?.mode === 'local');
  if (branch?.mode === 'local') {
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
