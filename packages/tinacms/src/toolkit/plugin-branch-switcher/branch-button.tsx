import { useCMS } from '@toolkit/react-tinacms';
import * as React from 'react';
import {
  BiChevronDown,
  BiGitBranch,
  BiLinkExternal,
  BiLockAlt,
} from 'react-icons/bi';
import { cn } from '../../utils/cn';
import { Button } from '../styles/button';
import { useBranchData } from './branch-data';
import { BranchModal } from './branch-modal';

export const BranchButton = ({ className = '' }) => {
  const [open, setOpen] = React.useState(false);
  const { currentBranch } = useBranchData();

  const cms = useCMS();
  const branchingEnabled = cms.flags.get('branch-switcher');

  if (!branchingEnabled) {
    return null;
  }

  const isProtected = cms.api.tina.usingProtectedBranch();

  return (
    <>
      <Button
        variant={'secondary'}
        size='custom'
        className={cn(
          'pointer-events-auto px-3 py-3 flex shrink gap-1 items-center justify-between',
          className
        )}
        onClick={() => setOpen(true)}
        title={currentBranch}
      >
        {isProtected ? (
          <BiLockAlt className='flex-shrink-0 h-6 w-auto opacity-70' />
        ) : (
          <BiGitBranch className='flex-shrink-0 h-6 w-auto opacity-70 text-zinc-400' />
        )}
        <span className='truncate max-w-full -mr-1'>{currentBranch}</span>
        <BiChevronDown
          className='-mr-1 h-4 w-4 opacity-70 shrink-0'
          aria-hidden='true'
        />
      </Button>
      {open && <BranchModal close={() => setOpen(false)} />}
    </>
  );
};

export const BranchPreviewButton = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) => {
  const cms = useCMS();
  const branchingEnabled = cms.flags.get('branch-switcher');

  if (!branchingEnabled) {
    return null;
  }

  const previewFunction = cms.api?.tina?.schema?.config?.config?.ui?.previewUrl;
  const branch = cms.api?.tina?.branch;
  const previewUrl =
    typeof previewFunction === 'function'
      ? previewFunction({ branch })?.url
      : null;

  if (!previewUrl) {
    return null;
  }

  return (
    <button
      type='button'
      className='p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded'
      {...props}
      onClick={() => {
        window.open('', '_blank');
      }}
      title='Preview site in new tab'
    >
      <span className='sr-only'>Preview</span>
      <BiLinkExternal className='h-5 w-auto' />
    </button>
  );
};
