import {
  BillingWarning,
  BranchButton,
  BranchPreviewButton,
  LocalWarning,
  NavMenuTrigger,
} from '@tinacms/toolkit';
import React from 'react';
import { TinaIcon } from '@toolkit/icons';

export const PageWrapper = ({
  headerClassName,
  children,
}: {
  headerClassName?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className='relative left-0 w-full h-full bg-gradient-to-b from-gray-50/50 to-gray-50 overflow-y-auto transition-opacity duration-300 ease-out flex flex-col opacity-100'>
      <header className={`sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm py-0 w-full ${headerClassName ?? ''}`}>
        <BillingWarning />
        <div className='flex items-center gap-3 px-2 py-2 min-h-[52px]'>
          <NavMenuTrigger className='ml-0 flex-shrink-0' />
          <TinaIcon className='self-center h-8 min-w-8 w-auto text-orange-500 flex-shrink-0' />
          <div className='flex-1 min-w-0' />
          <LocalWarning />
          <BranchButton />
          <BranchPreviewButton />
        </div>
      </header>
      <div className='flex-1 flex flex-col'>
        {children}
      </div>
    </div>
  );
};

export const PageHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className='pt-5 pb-3 px-6 border-b border-gray-100'>
      <div className='w-full flex justify-between items-end'>{children}</div>
    </div>
  );
};

export const PageBody = ({ children }: { children: React.ReactNode }) => (
  <div className='py-5 px-6'>{children}</div>
);
