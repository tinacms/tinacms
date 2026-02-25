import * as React from 'react';
import { CloseIcon, TinaIcon } from '@toolkit/icons';

export interface ModalHeaderProps {
  children: React.ReactNode;
  close?(): void;
}

export const ModalHeader = ({ children, close }: ModalHeaderProps) => {
  return (
    <div className='min-h-14 flex items-center px-5 py-2 border-b border-gray-200 m-0'>
      <TinaIcon className='w-10 h-auto -ml-1 mr-1 fill-tina-orange' />
      <ModalTitle>{children}</ModalTitle>
      {close && (
        <div
          onClick={close}
          className='ml-auto flex justify-self-end items-center fill-gray-400 cursor-pointer transition-colors duration-100 ease-out hover:fill-gray-700'
        >
          <CloseIcon className='w-6 h-auto' />
        </div>
      )}
    </div>
  );
};

const ModalTitle = ({ children }) => {
  return (
    <h2 className='text-black font-sans font-medium text-base leading-normal m-0 flex items-center'>
      {children}
    </h2>
  );
};
