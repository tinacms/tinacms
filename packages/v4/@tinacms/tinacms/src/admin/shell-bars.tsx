import { BranchSwitcher } from '@tinacms/ui/components/branch-switcher';
import { SaveProgress } from '@tinacms/ui/components/save-progress';
import { SidebarTrigger } from '@tinacms/ui/components/sidebar';
import { StatusBar } from '@tinacms/ui/components/status-bar';
import { TopBar } from '@tinacms/ui/components/top-bar';
import tinaLogo from '@tinacms/ui/assets/tinacms-logo.svg';
import { useEffect, useState } from 'react';
import {
  type SaveSummary,
  useAnyFormDirty,
  useSaveSummary,
} from '../form/form-store';
import { useBranchView } from '../editor/branch';
import { AccountMenu } from './account-menu';
import { SearchControl } from './search';

// A save shorter than this finishes before the card would flash.
const SAVE_PROGRESS_DELAY_MS = 1000;

const STATUS_WORDS: Record<SaveSummary['state'], string> = {
  idle: 'No changes',
  unsaved: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  failed: 'Save failed',
};

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
  if (branch?.mode !== 'branches' || !branch.name) return null;
  return (
    <BranchSwitcher
      current={branch.name}
      branches={branch.branches}
      disabled={saving}
      blockedMessage={dirty ? 'Save or discard your changes first' : undefined}
      onSwitch={branch.switchTo}
    />
  );
}

export function ShellTopBar({ projectName }: { projectName?: string }) {
  return (
    <TopBar
      toggle={<SidebarTrigger />}
      logo={
        <img src={tinaLogo} alt='TinaCMS' className='h-5 w-auto flex-none' />
      }
      projectName={projectName}
      branch={<BranchControl />}
      search={<SearchControl />}
      account={<AccountMenu />}
    />
  );
}

export function ShellStatusBar() {
  const branch = useBranchView();
  const { state } = useSaveSummary();
  const words = STATUS_WORDS[state];
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
