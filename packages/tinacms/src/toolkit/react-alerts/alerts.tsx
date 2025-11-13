import type { Alerts as AlertsCollection } from '@toolkit/alerts';
import { Toaster } from '@toolkit/components/ui/sonner';
import { useSubscribable } from '@toolkit/react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '@toolkit/react-modals';
import { Button } from '@toolkit/styles';
import React from 'react';
import { MdError } from 'react-icons/md';

const parseUrlsInText = (text: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const href = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a
          key={index}
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 underline hover:text-blue-800'
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export interface AlertsProps {
  alerts: AlertsCollection;
}

export function Alerts({ alerts }: AlertsProps) {
  useSubscribable(alerts);

  return (
    <>
      {/* Sonner toaster for non-error alerts */}
      <Toaster />

      {/* Modal for error alerts */}
      {alerts.all
        .filter((alert) => {
          return alert.level === 'error';
        })
        .map((alert) => {
          const AlertMessage =
            typeof alert.message === 'string'
              ? () => {
                  return (
                    <p className='text-base mb-3 overflow-y-auto'>
                      {parseUrlsInText(alert.message.toString())}
                    </p>
                  );
                }
              : alert.message;

          return (
            <Modal key={alert.id}>
              <PopupModal>
                <ModalHeader
                  close={() => {
                    alerts.dismiss(alert);
                  }}
                >
                  <MdError className='mr-1 w-6 h-auto fill-current inline-block text-red-600' />{' '}
                  Error
                </ModalHeader>
                <ModalBody padded={true}>
                  <div className='tina-prose'>
                    <AlertMessage />
                  </div>
                </ModalBody>
                <ModalActions>
                  <div className='flex-1' />
                  <Button
                    style={{ flexGrow: 1 }}
                    onClick={() => {
                      alerts.dismiss(alert);
                    }}
                  >
                    Close
                  </Button>
                </ModalActions>
              </PopupModal>
            </Modal>
          );
        })}
    </>
  );
}
