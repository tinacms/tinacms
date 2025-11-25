import {
  BillingWarning,
  BranchButton,
  BranchPreviewButton,
  LocalWarning,
} from '@tinacms/toolkit';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { TinaIcon } from '@toolkit/icons';
import { AdminNav } from './AdminNav';

export const PageWrapper = ({
  headerClassName,
  children,
}: {
  headerClassName?: string;
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const isOnDashboard = location.pathname === '/';

  return (
    <div className='relative left-0 w-full h-full bg-gradient-to-b from-gray-50/50 to-gray-50 overflow-y-auto transition-opacity duration-300 ease-out flex flex-col opacity-100'>
      <div className={`py-2 pr-4 w-full ${headerClassName}`}>
        <BillingWarning />
        <div className='flex items-center gap-4'>
          <AdminNav defaultOpen={isOnDashboard} sidebarWidth={360} />
          <TinaIcon className='self-center h-10 min-w-10 w-auto text-orange-500' />
          <LocalWarning />
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
