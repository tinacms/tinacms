import React from 'react';
import {
  AlertCircle,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import type { Column } from '@tanstack/react-table';
import { Button } from '../ui/button';

export const DashboardPage = ({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className='p-8 w-full max-w-6xl mx-auto font-sans'>
    <div className='flex items-center justify-between mb-6'>
      <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-3'>
        <div className='text-3xl text-tina-orange'>{icon}</div>
        {title}
      </h2>
      {action}
    </div>
    {children}
  </div>
);

export const InfoCard = ({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
}) => (
  <div className='bg-white rounded-xl border border-gray-200 shadow-sm flex flex-row items-center gap-4 p-6'>
    <div className={`${iconBg} p-3 rounded-lg flex-shrink-0`}>{icon}</div>
    <div className='min-w-0'>
      <p className='text-sm text-gray-500 font-medium'>{label}</p>
      {value}
    </div>
  </div>
);

export const DashboardLoadingState = ({
  message = 'Loading dashboard...',
}: {
  message?: string;
}) => (
  <div className='flex items-center justify-center p-12'>
    <div className='text-gray-500 text-lg animate-pulse'>{message}</div>
  </div>
);

export const DashboardErrorState = ({ message }: { message: string }) => (
  <div className='p-8 text-red-500 bg-red-50 rounded-lg m-8'>
    <h3 className='text-lg font-bold mb-2 flex items-center gap-2'>
      <AlertCircle className='text-xl' /> Error Loading Dashboard
    </h3>
    <p>{message}</p>
  </div>
);

export const RefreshButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant='outline'
    onClick={onClick}
    className='flex items-center gap-2 shadow-sm font-medium transition-colors'
  >
    <RefreshCw className='w-4 h-4' />
    Refresh
  </Button>
);

export const DashboardSection = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
    <div className='flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50/50 px-6 py-4'>
      <h3 className='text-lg font-semibold text-gray-800'>{title}</h3>
      {action}
    </div>
    <div className='p-0'>{children}</div>
  </div>
);

export const SortableHeader = ({
  column,
  children,
  align = 'left',
}: {
  column: Column<any, unknown>;
  children: React.ReactNode;
  align?: 'left' | 'right';
}) => {
  const sorted = column.getIsSorted();
  return (
    <button
      type='button'
      className={`font-medium text-muted-foreground !cursor-pointer flex items-center gap-1 ${
        align === 'right' ? 'ml-auto' : ''
      }`}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      {sorted === 'asc' ? (
        <ArrowUp className='ml-2 h-4 w-4' />
      ) : sorted === 'desc' ? (
        <ArrowDown className='ml-2 h-4 w-4' />
      ) : (
        <ArrowUpDown className='ml-2 h-4 w-4' />
      )}
    </button>
  );
};
