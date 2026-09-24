import { CircleAlert } from 'lucide-react';
import React from 'react';
import type { EditorialWorkflowErrorCopy } from './editorial-workflow-utils';

export const EditorialWorkflowErrorBox = ({
  error,
}: {
  error: EditorialWorkflowErrorCopy;
}) => (
  <div className='flex items-start gap-1 text-red-700 py-2 px-3 mb-4 bg-red-50 border border-red-200 rounded'>
    <CircleAlert className='w-5 h-auto text-red-400 flex-shrink-0' />
    <span className='text-sm whitespace-pre-line'>
      <b>Error:</b> <EditorialWorkflowErrorMessage error={error} />
    </span>
  </div>
);

export const EditorialWorkflowErrorMessage = ({
  error,
}: {
  error: EditorialWorkflowErrorCopy;
}) => (
  <>
    {error.messageParts.map((part, index) =>
      part.emphasis ? (
        <b key={index}>{part.text}</b>
      ) : (
        <React.Fragment key={index}>{part.text}</React.Fragment>
      )
    )}
    {error.link && (
      <>
        {' '}
        <a
          className='underline text-tina-orange-dark font-medium'
          href={error.link.url}
          target='_blank'
          rel='noreferrer'
        >
          {error.link.label}
        </a>
      </>
    )}
  </>
);
