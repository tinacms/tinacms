import {
  Button,
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '@tinacms/toolkit';
import React from 'react';

export const UnableToLoadModal = ({ message }: { message: string }) => (
  <Modal>
    <PopupModal>
      <ModalHeader>Unable to load</ModalHeader>
      <ModalBody padded={true}>
        <div className='tina-prose'>{message}</div>
      </ModalBody>
      <ModalActions>
        <div className='flex-1'></div>
        <Button
          style={{ flexGrow: 1 }}
          className='w-full'
          variant='primary'
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload
        </Button>
      </ModalActions>
    </PopupModal>
  </Modal>
);
