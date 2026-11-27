import { BranchSwitcher } from '@tinacms/ui/components/branch-switcher';
import { SaveProgress } from '@tinacms/ui/components/save-progress';
import { SidebarTrigger } from '@tinacms/ui/components/sidebar';
import { StatusBar } from '@tinacms/ui/components/status-bar';
import { TopBar } from '@tinacms/ui/components/top-bar';
import tinaLogo from '@tinacms/ui/assets/tinacms-logo.svg';
import tinaMark from '@tinacms/ui/assets/tinacms-mark.svg';
import { useTier } from '@tinacms/ui/hooks/use-tier';
import { useEffect, useState } from 'react';
import { useAnyFormDirty, useSaveSummary } from '../form/form-store';
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
