import { Button } from '@tinacms/toolkit';
import { CircleAlert, RefreshCw } from 'lucide-react';
import React from 'react';

export const FullscreenError = ({
  title = 'Error',
  errorMessage = 'It looks like something went wrong.',
}) => {
  return (
    <div className='flex flex-col justify-center items-center h-screen bg-gray-100'>
      <div className='text-red-500 text-4xl mb-6 flex items-center'>
        <CircleAlert className='w-12 h-auto text-red-400 opacity-70 mr-1' />{' '}
        {title}
      </div>
      <p className='text-gray-700 text-xl mb-8'>{errorMessage}</p>
      <Button variant='danger' onClick={() => window.location.reload()}>
        <RefreshCw className='w-7 h-auto opacity-70 mr-1' /> Reload
      </Button>
    </div>
  );
};
