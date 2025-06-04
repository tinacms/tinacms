import { useCMS } from '@toolkit/react-tinacms';
import * as React from 'react';
import {
  BiChevronDown,
  BiGitBranch,
  BiLinkExternal,
  BiLockAlt,
} from 'react-icons/bi';
import { useBranchData } from './branch-data';
import { BranchModal } from './branch-modal';

// trim 'tina/' prefix from branch name
const trimPrefix = (branchName: string) => {
  return branchName.replace(/^tina\//, '');
};

export const BranchButton = () => {
  const [open, setOpen] = React.useState(false);
  const openModal = () => setOpen(true);
  const { currentBranch } = useBranchData();

  const cms = useCMS();
  const isProtected = cms.api.tina.usingProtectedBranch();

  return (
    <div className='py-2'>
      <button
        className={`pointer-events-auto flex min-w-0	shrink gap-1 items-center justify-between form-select text-sm h-10 px-4 shadow transition-color duration-150 ease-out rounded-full focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out text-[12px] leading-tight min-w-[5rem] ${
          isProtected
            ? 'text-white hover:text-blue-50 bg-blue-500 hover:bg-blue-400 border-0'
            : 'text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-100'
        }`}
        onClick={openModal}
      >
        {isProtected ? (
          <BiLockAlt className='flex-shrink-0 w-4.5 h-auto opacity-70 text-white' />
        ) : (
          <BiGitBranch
            className={`flex-shrink-0 w-4.5 h-auto opacity-70 text-zinc-400`}
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
      {open && (
        <BranchModal
          close={() => {
            setOpen(false);
          }}
        />
      )}
    </div>
  );
};

export const BranchPreviewButton = () => {
  const cms = useCMS();
  const previewFunction = cms.api?.tina?.schema?.config?.config?.ui?.previewUrl;
  const branch = cms.api?.tina?.branch;
  const previewUrl = 'https://preview.tinajs.io/';
  typeof previewFunction === 'function'
    ? previewFunction({ branch })?.url
    : null;

  if (!previewUrl) {
    return null;
  }

  return (
    <button
      className='pointer-events-auto flex min-w-0	shrink gap-1 items-center justify-between form-select text-sm h-10 px-4 shadow text-gray-500 hover:text-blue-500 bg-white hover:bg-gray-50 border border-gray-100 transition-color duration-150 ease-out rounded-full focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out text-[12px] leading-tight min-w-[5rem]'
      onClick={() => {
        window.open(previewUrl, '_blank');
      }}
    >
      <span className='truncate max-w-full min-w-0 shrink'>Preview</span>
      <BiLinkExternal className='flex-shrink-0 w-4 h-auto text-blue-500/70 ml-1' />
    </button>
  );
};
