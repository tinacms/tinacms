import React from 'react';
import { Button } from '@toolkit/styles';
import {
  Modal,
  ModalHeader,
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
        <ModalHeader close={onClose}>Unsaved changes</ModalHeader>
        <ModalBody padded={true}>
          <p>
            You have unsaved changes. Do you want to discard them and leave this
            page?
          </p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={onClose}>
            Keep editing
          </Button>
          <Button style={{ flexGrow: 3 }} variant='danger' onClick={onDiscard}>
            Discard changes
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  );
};
