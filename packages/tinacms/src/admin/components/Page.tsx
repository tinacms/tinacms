import {
  BillingWarning,
  BranchButton,
  BranchPreviewButton,
  LocalWarning,
} from '@tinacms/toolkit';
import React from 'react';

export const PageWrapper = ({
  headerClassName,
  children,
}: {
  headerClassName?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className='relative left-0 w-full h-full bg-gradient-to-b from-gray-50/50 to-gray-50 shadow-2xl overflow-y-auto transition-opacity duration-300 ease-out flex flex-col opacity-100'>
      <div className={`py-2 px-4 ${headerClassName}`}>
        <LocalWarning />
        <BillingWarning />
        <div className='flex justify-between items-center'>
          <BranchButton />
          <BranchPreviewButton />
        </div>
      </div>
      {children}
    </div>
  );
};

export const PageHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className='pt-4 pb-2 px-6'>
      <div className='w-full flex justify-between items-end'>{children}</div>
    </div>
  );
};

export const PageBody = ({ children }: { children: React.ReactNode }) => (
  <div className='py-4 px-6'>{children}</div>
);
