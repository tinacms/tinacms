import React from 'react';
import { BiArrowBack } from 'react-icons/bi';
import { useCMS } from '@toolkit/react-core';

export const BackButton = ({ onClick }: { onClick: () => void }) => {
  const cms = useCMS();
  const isTopLevel = cms.state.breadcrumbs.length <= 1;

  if (!isTopLevel) return null;

  return (
    <button
      type='button'
      onClick={onClick}
      className='shrink-0 px-1.5 py-1.5 rounded transition ease-out duration-100 text-blue-500 hover:text-blue-600 hover:bg-gray-50/50'
      aria-label='Back to collection'
    >
      <BiArrowBack className='w-6 h-full opacity-70' />
    </button>
  );
};
