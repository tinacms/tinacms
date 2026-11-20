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
import { use, useEffect, useRef, useState } from 'react';
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

function BranchControl() {
  const runtime = use(TinaRuntimeContext);
  const branch = useBranchView();
  const saving = useSaveSummary().state === 'saving';
  const dirty = useAnyFormDirty();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState<CreateRequest>();
  const entries = useBranchEntries(branch, open);

  const create = branch?.create;
  const latest = useRef<{
    branch: typeof branch;
    open: boolean;
    startCreate: (request: CreateRequest) => void;
  }>({ branch, open, startCreate: () => {} });
  const startCreate = (request: CreateRequest) => {
    if (readAnyFormDirty()) {
      toast({ tone: 'warning', title: 'Save or discard your changes first' });
      return;
    }
    const running = latest.current.branch?.creating;
    if (running) {
      toast({
        tone: 'warning',
        title: `Wait for ${running.name} to finish first`,
        text: 'Only one branch is made at a time.',
      });
      return;
    }
    setFailed(undefined);
    create?.(request.name, request.from);
  };

  const result = branch?.createResult;
  latest.current = { branch, open, startCreate };
  useEffect(() => {
    if (!result) return;
    const { branch: view, open: isOpen, startCreate: retry } = latest.current;
    runtime?.store.setState((state) => ({
      branch: { ...state.branch, createResult: undefined },
    }));
    if (!view) return;
    const { name, from, startedOn: began, outcome } = result;
    if (outcome === 'failed') {
      if (isOpen) {
        setFailed({ name, from });
        return;
      }
      toast({
        tone: 'error',
        title: `Couldn't create ${name}`,
        text: 'Check your connection, then retry.',
        action: { label: 'Retry', onClick: () => retry({ name, from }) },
      });
      return;
    }
    if (outcome === 'unready') {
      toast({
        tone: 'warning',
        title: `${name} isn't ready yet`,
        text: 'It was made. Try switching to it in a few minutes.',
      });
      return;
    }
    const startedOn = began ?? view.defaultBranch;
    if (isOpen && view.name === startedOn && !readAnyFormDirty()) {
      view.switchTo(name);
      setOpen(false);
      return;
    }
    toast({
      tone: 'success',
      title: `${name} is ready`,
      action: {
        label: `Switch to ${name}`,
        onClick: () => {
          if (readAnyFormDirty()) {
            toast({
              tone: 'warning',
              title: 'Save or discard your changes first',
            });
            return;
          }
          latest.current.branch?.switchTo(name);
        },
      },
    });
  }, [result, runtime]);

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
      baseBranch={branch.defaultBranch}
      onCreate={
        create ? (name, from) => startCreate({ name, from }) : undefined
      }
      createState={
        branch.creating
          ? 'creating'
          : failed || (result?.outcome === 'failed' && open)
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
