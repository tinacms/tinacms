import React from 'react';
import { AlertCircle } from 'lucide-react';
import { LoadingDots } from '@tinacms/toolkit';

export const DashboardLoadingState = ({
  message,
  progress,
}: {
  message: string;
  progress?: {
    value: number;
    label?: string;
  };
}) => (
  <div className='flex items-center justify-center p-12'>
    <div className='text-center text-gray-500'>
      <h3 className='text-lg font-semibold text-gray-700 animate-pulse'>
        Loading Dashboard
      </h3>
      <p className='mt-2 text-sm'>{message}</p>
      {progress ? (
        <div className='mt-4 w-72 max-w-full mx-auto'>
          <div className='h-2 rounded-full bg-gray-200 overflow-hidden'>
            <div
              className='h-full bg-tina-orange transition-[width] duration-300 ease-out'
              style={{
                width: `${Math.max(0, Math.min(100, progress.value))}%`,
              }}
            />
          </div>
          <div className='mt-2 flex items-center justify-between text-xs text-gray-500'>
            <span>{progress.label || 'In progress'}</span>
            <span>{Math.round(progress.value)}%</span>
          </div>
        </div>
      ) : (
        <div className='mt-4 flex justify-center'>
          <LoadingDots color='var(--tina-color-primary)' />
        </div>
      )}
    </div>
  </div>
);

export const DashboardErrorState = ({ message }: { message: string }) => (
  <div className='p-8 text-red-500 bg-red-50 rounded-lg m-8'>
    <h3 className='text-lg font-bold mb-2 flex items-center gap-2'>
      <AlertCircle className='text-xl' /> Dashboard Error
    </h3>
    <p>{message}</p>
  </div>
);

export const DashboardTitleBar = ({
  title,
  icon,
  controls,
}: {
  title: string;
  icon: React.ReactNode;
  controls?: React.ReactNode;
}) => (
  <div className='mb-6 flex items-center justify-between gap-4'>
    <div className='flex items-center gap-3'>
      <span className='text-3xl text-tina-orange'>{icon}</span>
      <h2 className='text-2xl font-bold text-gray-800'>{title}</h2>
    </div>
    {controls}
  </div>
);
