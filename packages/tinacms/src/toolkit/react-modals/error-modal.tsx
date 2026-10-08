import { CircleAlert } from 'lucide-react';
import React from 'react';
import { Modal, ModalActions, ModalBody, ModalHeader } from './modal';
import { PopupModal } from './popup-modal';

export interface ErrorModalProps {
  title: string;
  actions: React.ReactNode;
  close?: () => void;
  children: React.ReactNode;
}

export const ErrorModal = ({
  title,
  actions,
  close,
  children,
}: ErrorModalProps) => (
  <Modal>
    <PopupModal>
      <ModalHeader close={close}>
        <CircleAlert className='mr-1 w-6 h-auto inline-block text-red-600' />{' '}
        {title}
      </ModalHeader>
      <ModalBody padded={true}>
        <div className='tina-prose whitespace-pre-wrap'>{children}</div>
      </ModalBody>
      <ModalActions align='end'>{actions}</ModalActions>
    </PopupModal>
  </Modal>
);
