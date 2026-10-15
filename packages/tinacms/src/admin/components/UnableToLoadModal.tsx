import { Button, ErrorModal } from '@tinacms/toolkit';
import React from 'react';

export const UnableToLoadModal = ({ message }: { message: string }) => (
  <ErrorModal
    title='Unable to Load'
    actions={
      <Button
        className='w-full sm:w-auto'
        variant='primary'
        onClick={() => {
          window.location.reload();
        }}
      >
        Reload
      </Button>
    }
  >
    {message}
  </ErrorModal>
);
