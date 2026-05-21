import React from 'react';
import { AiFillWarning } from 'react-icons/ai';

const DISMISSED_KEY = 'tina:back-warning-dismissed';

export const UnsavedChangesDialog = ({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}) => {
  if (!open) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    onDismiss();
  };

  return (
    <div className='flex items-center gap-2 px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-sm text-yellow-800'>
      <AiFillWarning className='w-5 h-5 shrink-0 text-yellow-600' />
      <span>Leaving the page will discard any changes.</span>
      <button
        type='button'
        onClick={handleDismiss}
        className='ml-auto shrink-0 text-yellow-600 hover:text-yellow-800 underline underline-offset-2 transition-colors duration-100'
      >
        Dismiss
      </button>
    </div>
  );
};

export const isBackWarningDismissed = () =>
  sessionStorage.getItem(DISMISSED_KEY) === '1';
