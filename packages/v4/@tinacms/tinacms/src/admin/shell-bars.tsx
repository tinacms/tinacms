import { BranchSwitcher } from '@tinacms/ui/components/branch-switcher';
import { SaveProgress } from '@tinacms/ui/components/save-progress';
import { SidebarTrigger } from '@tinacms/ui/components/sidebar';
import { StatusBar } from '@tinacms/ui/components/status-bar';
import { TopBar } from '@tinacms/ui/components/top-bar';
import tinaLogo from '@tinacms/ui/assets/tinacms-logo.svg';
import { useEffect, useState } from 'react';
import {
  type SaveFailureReason,
  type SaveSummary,
  useAnyFormDirty,
  useSaveSummary,
} from '../form/form-store';
import { useBranchView } from '../editor/branch';
import { AccountMenu } from './account-menu';
import { SaveAllControl } from './save-all';
import { SearchControl } from './search';
import { useOptionalContentSlice } from '../editor/hooks';

// A save shorter than this finishes before the card would flash.
const SAVE_PROGRESS_DELAY_MS = 1000;

const FAILURE_WORDS: Record<SaveFailureReason, string> = {
  conflict: 'Save failed: someone else saved first',
  'branch-gone': 'Save failed: branch no longer exists',
};

const savedWords = (saved: number, warnings: boolean | undefined) =>
  `Saved ${saved} ${saved === 1 ? 'document' : 'documents'}${warnings ? ' with warnings' : ''}`;

/** The Status bar's words for a save summary. Local files say so when nothing has saved. */
export function statusWords(summary: SaveSummary, local: boolean): string {
  switch (summary.state) {
    case 'idle':
      if (summary.runSaved) {
        return savedWords(summary.runSaved, summary.runWarnings);
      }
      if (summary.kept) return 'Unsaved edits kept in this browser';
      return local ? 'No saves yet this session' : 'No changes';
    case 'unsaved':
      return 'Unsaved changes';
    case 'saving':
      if (summary.runIndex !== undefined) {
        return `Saving ${summary.runIndex} of ${summary.runTotal}…`;
      }
      return 'Saving…';
    case 'saved':
      if (summary.runSaved) {
        return savedWords(summary.runSaved, summary.runWarnings);
      }
      return summary.document ? `Saved: “${summary.document}”` : 'Saved';
    case 'failed':
      if (summary.runFailed !== undefined) {
        return `Save failed: ${summary.runFailed} of ${summary.runTried} documents`;
      }
      return summary.reason ? FAILURE_WORDS[summary.reason] : 'Save failed';
  }
}

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

function BranchControl() {
  const branch = useBranchView();
  const saving = useSaveSummary().state === 'saving';
  const dirty = useAnyFormDirty();
  if (branch?.mode !== 'branches') return null;
  const loading = branch.listState === 'loading';
  if (!branch.name && !loading && branch.listState !== 'failed') return null;
  return (
    <BranchSwitcher
      current={branch.name}
      status={branch.listState ?? 'ready'}
      onRetry={branch.retryList}
      branches={branch.branches}
      disabled={saving}
      blockedMessage={dirty ? 'Save or discard your changes first' : undefined}
      onSwitch={branch.switchTo}
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
