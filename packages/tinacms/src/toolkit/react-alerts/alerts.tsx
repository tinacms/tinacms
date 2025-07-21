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
import { BiCheckCircle, BiError, BiInfoCircle, BiX } from 'react-icons/bi';

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
      <div className='fixed bottom-0 left-0 right-0 p-6 flex flex-col items-center z-[999999]'>
        {alerts.all
          .filter((alert) => {
            return alert.level !== 'error';
          })
          .map((alert) => {
            return (
              <Alert key={alert.id} level={alert.level}>
                {alert.level === 'info' && (
                  <BiInfoCircle className='w-5 h-auto opacity-70' />
                )}
                {alert.level === 'success' && (
                  <BiCheckCircle className='w-5 h-auto opacity-70' />
                )}
                {alert.level === 'warn' && (
                  <BiError className='w-5 h-auto opacity-70' />
                )}
                <p className='m-0 flex-1 max-w-[680px] text-left'>
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
                  <BiError className='mr-1 w-6 h-auto fill-current inline-block text-red-600' />{' '}
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
    info: 'bg-blue-100 border-blue-500 text-blue-600 fill-blue-500',
    success: 'bg-green-100 border-green-500 text-green-600 fill-green-500',
    warn: 'bg-yellow-100 border-yellow-500 text-yellow-600 fill-yellow-500',
    error: 'bg-red-100 border-red-500 text-red-600 fill-red-500',
  };

  const borderClasses = {
    info: 'border-blue-200',
    success: 'border-green-200',
    warn: 'border-yellow-200',
    error: 'border-red-200',
  };

  return (
    <div
      className={`rounded shadow-lg border-l-[6px] font-normal cursor-pointer pointer-events-all text-sm transition-all duration-100 ease-out mb-4 max-w-full ${colorClasses[level]}}`}
      style={{
        animationName: 'fly-in-up, fade-in',
        animationTimingFunction: 'ease-out',
        animationIterationCount: 1,
        animationFillMode: 'both',
        animationDuration: '150ms',
      }}
    >
      <div
        className={`flex items-center gap-1.5 min-w-[350px] rounded-r border p-2 ${borderClasses[level]}`}
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
    <BiX className='w-5 auto flex-grow-0 flex-shrink-0 opacity-50' />
  </button>
);
