import React from 'react';
import { AiFillWarning } from 'react-icons/ai';
import { CloseIcon } from '@toolkit/icons';
import { Button } from '@toolkit/styles';
import {
  Modal,
  ModalBody,
  ModalActions,
  ModalPopup,
} from '@toolkit/react-modals';

export const UnsavedChangesDialog = ({
  open,
  onClose,
  onDiscard,
}: {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
}) => {
  if (!open) return null;

  return (
    <Modal>
      <ModalPopup>
        <div className='flex items-center px-5 py-2 border-b border-gray-200'>
          <AiFillWarning className='w-7 h-auto -ml-1 mr-1 text-yellow-600' />
          <h2 className='text-black font-sans font-medium text-base m-0 block truncate flex items-center'>
            Unsaved changes
          </h2>
          <div
            onClick={onClose}
            className='ml-auto flex justify-self-end items-center fill-gray-400 cursor-pointer transition-colors duration-100 ease-out hover:fill-gray-700'
          >
            <CloseIcon className='w-6 h-auto' />
          </div>
        </div>
        <ModalBody padded={true}>
          <p>
            You have unsaved changes. Do you want to discard them and leave this
            page?
          </p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 3 }} onClick={onClose}>
            Keep editing
          </Button>
          <Button style={{ flexGrow: 2 }} variant='danger' onClick={onDiscard}>
            Discard changes
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  );
};
