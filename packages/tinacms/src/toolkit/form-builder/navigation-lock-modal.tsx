import * as React from 'react';
import { BiError } from 'react-icons/bi';
import { Button } from '@toolkit/styles';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';

export interface NavigationLockModalProps {
  /**
   * Called when the user chooses to stay on the page
   */
  onStay: () => void;
  /**
   * Called when the user chooses to leave the page (discard changes)
   */
  onLeave: () => void;
}

/**
 * Modal displayed when user tries to navigate away with unsaved changes.
 * Provides options to stay on the page or leave (discarding changes).
 */
export const NavigationLockModal: React.FC<NavigationLockModalProps> = ({
  onStay,
  onLeave,
}) => {
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={onStay}>Unsaved Changes</ModalHeader>
        <ModalBody padded={true}>
          <div className='flex items-start gap-3'>
            <BiError className='w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5' />
            <div>
              <p className='text-gray-700 mb-2'>
                You have unsaved changes that will be lost if you leave this
                page.
              </p>
              <p className='text-gray-500 text-sm'>
                Would you like to stay on this page and save your changes, or
                leave without saving?
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalActions align='end'>
          <Button variant='secondary' onClick={onLeave}>
            Leave without saving
          </Button>
          <Button variant='primary' onClick={onStay}>
            Stay on page
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  );
};
