import {
  BranchSwitcher,
  LocalFilesBadge,
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
  | { kind: 'failed'; name: string; from: string }
  | { kind: 'unready'; name: string }
  | { kind: 'ready'; name: string };

const DIRTY_REASON = 'Save or discard your changes first';

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
  const [failed, setFailed] = useState<CreateRequest>();
  const [held, setHeld] = useState<Outcome>();
  const [reason, setReason] = useState<string>();
  const [formShown, setFormShown] = useState(false);
  const startedVia = useRef<'form' | 'note'>('form');
  const entries = useBranchEntries(branch, open);

  const create = branch?.create;
  const latest = useRef<{
    branch: typeof branch;
    open: boolean;
    formShown: boolean;
    startCreate: (request: CreateRequest, via?: 'form' | 'note') => boolean;
  }>({ branch, open, formShown, startCreate: () => false });
  const startCreate = (
    request: CreateRequest,
    via: 'form' | 'note' = 'form'
  ): boolean => {
    if (readAnyFormDirty()) {
      refuse(DIRTY_REASON);
      return false;
    }
    const running = latest.current.branch?.creating;
    if (running) {
      refuse(`Wait for ${running.name} to finish first`);
      return false;
    }
    setFailed(undefined);
    setHeld(undefined);
    setReason(undefined);
    startedVia.current = via;
    create?.(request.name, request.from);
    return true;
  };

  // A refused action says why inside the switcher while it is open, else in a toast.
  const refuse = (message: string) => {
    if (latest.current.open) setReason(message);
    else toast({ tone: 'warning', title: message });
  };

  const switchTo = (name: string): boolean => {
    if (readAnyFormDirty()) {
      refuse(DIRTY_REASON);
      return false;
    }
    latest.current.branch?.switchTo(name);
    return true;
  };

  const currentName = branch?.name;
  useEffect(() => {
    setHeld((note) =>
      note?.kind === 'ready' && note.name === currentName ? undefined : note
    );
  }, [currentName]);

  const result = branch?.createResult;
  latest.current = { branch, open, formShown, startCreate };
  useEffect(() => {
    if (!result) return;
    const { branch: view, open: isOpen } = latest.current;
    runtime?.store.setState((state) => ({
      branch: { ...state.branch, createResult: undefined },
    }));
    if (!view) return;
    const { name, from, startedOn: began, outcome } = result;
    setReason(undefined);
    if (outcome === 'failed') {
      if (isOpen && latest.current.formShown && startedVia.current === 'form') {
        setHeld(undefined);
        setFailed({ name, from });
      } else {
        setFailed(undefined);
        setHeld({ kind: 'failed', name, from });
      }
      return;
    }
    setFailed(undefined);
    if (outcome === 'unready') {
      setHeld({ kind: 'unready', name });
      return;
    }
    const startedOn = began ?? view.defaultBranch;
    if (isOpen && view.name === startedOn && !readAnyFormDirty()) {
      setHeld(undefined);
      view.switchTo(name);
      setOpen(false);
      return;
    }
    setHeld({ kind: 'ready', name });
  }, [result, runtime]);

  const outcome = useMemo<Outcome | undefined>(
    () => held ?? (failed ? { kind: 'failed', ...failed } : undefined),
    [held, failed]
  );

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
    if (sent.current?.outcome === outcome) return;
    const act =
      (id: () => string | number, run: () => boolean | void) => () => {
        toast.dismiss(id());
        if (run() !== false) setReason(undefined);
      };
    let id: string | number = '';
    const idOf = () => id;
    if (outcome.kind === 'failed') {
      id = toast({
        tone: 'error',
        title: `Couldn't create ${outcome.name}`,
        text: 'Check your connection, then retry.',
        action: {
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
        text: 'It was made. Try switching to it in a few minutes.',
      });
    } else {
      id = toast({
        tone: 'success',
        title: `${outcome.name} is ready`,
        action: {
          label: `Switch to ${outcome.name}`,
          onClick: act(idOf, () => {
            if (readAnyFormDirty()) {
              toast({ tone: 'warning', title: DIRTY_REASON });
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
      onFormChange={(shown) => {
        setFormShown(shown);
        if (!shown) setFailed(undefined);
      }}
      note={held ? { ...held, reason } : undefined}
      onNoteAction={handle}
      onNoteDismiss={() => {
        setHeld(undefined);
        setReason(undefined);
      }}
      creatingBranch={branch.creating?.name}
      baseBranch={branch.defaultBranch}
      onCreate={
        create ? (name, from) => startCreate({ name, from }) : undefined
      }
      createState={
        branch.creating
          ? 'creating'
          : failed ||
              (result?.outcome === 'failed' &&
                open &&
                formShown &&
                startedVia.current === 'form')
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
