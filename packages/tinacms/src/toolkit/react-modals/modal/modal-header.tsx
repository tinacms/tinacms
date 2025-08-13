import * as React from 'react';
import { CloseIcon } from '@toolkit/icons';

export interface ModalHeaderProps {
  children: React.ReactChild | React.ReactChild[];
  close?(): void;
}

export const ModalHeader = ({ children, close }: ModalHeaderProps) => {
  return (
    <div className='h-14 flex items-center justify-between px-5 border-b border-gray-200 m-0 bg-orange-500'>
      <ModalTitle>{children}</ModalTitle>
      {close && (
        <div
          onClick={close}
          className='flex items-center fill-white opacity-70 cursor-pointer transition-colors duration-100 ease-out hover:opacity-100'
        >
          <CloseIcon className='w-6 h-auto' />
        </div>
      )}
    </div>
  );
};

const ModalTitle = ({ children }) => {
  return (
    <h2 className='text-white font-sans font-bold text-base leading-none m-0 block truncate flex items-center'>
      {children}
    </h2>
  );
};
