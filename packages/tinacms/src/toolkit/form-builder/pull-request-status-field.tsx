import * as React from 'react';

// Persisted preference key for whether editorial-workflow saves open a draft PR.
// Global (not per-project): one editor, one preference. Persistence itself is
// handled by the shared `useLocalStorage` hook at the call site.
export const IS_DRAFT_STORAGE_KEY = 'tina.editorialWorkflow.isDraft';

const Segment = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type='button'
    aria-pressed={active}
    onClick={onClick}
    className={`flex-1 text-center text-sm font-semibold py-[7px] px-2 rounded-md transition-all duration-150 ease-out ${
      active
        ? 'bg-white text-tina-orange-dark shadow-sm'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
);

/**
 * Segmented "Draft / Ready for review" control for the editorial-workflow modal.
 * Controlled: `isDraft` selects the active segment, `onChange` reports the new value.
 */
export const PullRequestStatusField = ({
  isDraft,
  onChange,
}: {
  isDraft: boolean;
  onChange: (isDraft: boolean) => void;
}) => {
  return (
    <div className='mt-4'>
      <label className='block font-sans text-xs font-semibold text-gray-700 whitespace-normal mb-2'>
        Pull request status
      </label>
      <div className='flex bg-gray-100 border border-gray-200 rounded-lg p-[3px] gap-[3px]'>
        <Segment active={isDraft} onClick={() => onChange(true)}>
          Draft
        </Segment>
        <Segment active={!isDraft} onClick={() => onChange(false)}>
          Ready for review
        </Segment>
      </div>
      <p className='text-xs text-gray-500 mt-2 leading-snug'>
        {isDraft
          ? 'Drafts stay hidden from reviewers until you mark them ready.'
          : 'Reviewers are notified right away and can start reviewing.'}
      </p>
    </div>
  );
};
