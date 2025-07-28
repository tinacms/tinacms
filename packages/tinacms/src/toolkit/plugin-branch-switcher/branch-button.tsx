import { useCMS } from '@toolkit/react-tinacms';
import * as React from 'react';
import {
  BiChevronDown,
  BiGitBranch,
  BiLinkExternal,
  BiLockAlt,
} from 'react-icons/bi';
import { cn } from '../../utils/cn';
import { useBranchData } from './branch-data';
import { BranchModal } from './branch-modal';

// trim 'tina/' prefix from branch name
const trimPrefix = (branchName: string) => {
  return branchName.replace(/^tina\//, '');
};

export const BranchButton = () => {
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
      <button
        className={cn(
          `pointer-events-auto px-3 py-3 flex shrink gap-1 items-center justify-between form-select text-sm shadow transition-color duration-150 ease-out rounded-lg`,
          `focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out `,
          isProtected
            ? 'text-white hover:text-blue-50 bg-blue-500 hover:bg-blue-400 border-0'
            : 'text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-100'
        )}
        onClick={() => setOpen(true)}
      >
        {isProtected ? (
          <BiLockAlt className='flex-shrink-0 h-4 w-auto opacity-70 text-white' />
        ) : (
          <BiGitBranch
            className={`flex-shrink-0 h-4 w-auto opacity-70 text-zinc-400`}
          />
        )}
        <span className='truncate max-w-full -mr-1'>
          {trimPrefix(currentBranch)}
        </span>
        <BiChevronDown
          className='-mr-1 h-4 w-4 opacity-70 shrink-0'
          aria-hidden='true'
        />
      </button>
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
        window.open(previewUrl, '_blank');
      }}
      title='Preview site in new tab'
    >
      <span className='sr-only'>Preview</span>
      <BiLinkExternal className='h-5 w-auto' />
    </button>
  );
};
