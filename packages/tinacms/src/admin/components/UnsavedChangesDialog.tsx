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
    <Modal>
      <ModalPopup>
        <div className='flex items-center px-5 py-2 border-b border-gray-200'>
          <AiFillWarning className='w-7 h-auto -ml-1 mr-1 text-yellow-600' />
          <h2 className='text-black font-sans font-medium text-base m-0 block truncate flex items-center'>
            Warning
          </h2>
          <div
            onClick={onDismiss}
            className='ml-auto flex justify-self-end items-center fill-gray-400 cursor-pointer transition-colors duration-100 ease-out hover:fill-gray-700'
          >
            <CloseIcon className='w-6 h-auto' />
          </div>
        </div>
        <ModalBody padded={true}>
          <p>Leaving the page will discard any unsaved changes.</p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 1 }} onClick={handleDismiss}>
            Dismiss
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  );
};

export const isBackWarningDismissed = () =>
  sessionStorage.getItem(DISMISSED_KEY) === '1';
