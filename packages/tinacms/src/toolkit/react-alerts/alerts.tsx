import type { AlertLevel, Alerts as AlertsCollection } from '@toolkit/alerts';
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
import { BiX } from 'react-icons/bi';
import { MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md';

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

  if (!alerts.all.length) {
    return null;
  }

  return (
    <>
      <div className='fixed bottom-6 left-1/2 flex flex-col items-center z-[999999] -translate-x-1/2'>
        {alerts.all
          .filter((alert) => {
            return alert.level !== 'error';
          })
          .map((alert) => {
            return (
              <Alert key={alert.id} level={alert.level}>
                {alert.level === 'info' && (
                  <MdInfo className='w-5 h-auto text-blue-500' />
                )}
                {alert.level === 'success' && (
                  <MdCheckCircle className='w-5 h-auto text-green-500' />
                )}
                {alert.level === 'warn' && (
                  <MdWarning className='w-5 h-auto text-yellow-500' />
                )}
                <p className='m-0 flex-1 max-w-[680px] text-left break-all'>
                  {parseUrlsInText(alert.message.toString())}
                </p>
                <CloseAlert
                  onClick={() => {
                    alerts.dismiss(alert);
                  }}
                />
              </Alert>
            );
          })}
      </div>
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

const Alert: React.FC<{ level: AlertLevel; children: React.ReactNode }> = ({
  level,
  ...props
}) => {
  const colorClasses = {
    info: 'bg-white',
    success: 'bg-white',
    warn: 'bg-white',
    error: 'bg-white',
  };

  const borderClasses = {
    info: 'border-blue-500',
    success: 'border-green-500',
    warn: 'border-amber-500',
    error: 'border-red-500',
  };

  return (
    <div
      className={`rounded-md shadow-lg font-medium cursor-pointer pointer-events-all text-sm transition-all duration-100 ease-out mb-4 max-w-full text-gray-700 ${colorClasses[level]}`}
      style={{
        animationName: 'fly-in-up, fade-in',
        animationTimingFunction: 'ease-out',
        animationIterationCount: 1,
        animationFillMode: 'both',
        animationDuration: '150ms',
      }}
    >
      <div
        className={`flex items-center gap-2 min-w-[350px] rounded-md border px-4 py-3 ${borderClasses[level]}`}
        {...props}
      />
    </div>
  );
};

const CloseAlert = ({ ...styleProps }) => (
  <button
    className='border-none bg-transparent p-0 outline-none flex items-center'
    {...styleProps}
  >
    <BiX className='w-5 auto flex-grow-0 flex-shrink-0 text-gray-700' />
  </button>
);
