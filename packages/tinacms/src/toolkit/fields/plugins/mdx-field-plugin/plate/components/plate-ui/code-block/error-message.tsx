'use client';

import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div
      contentEditable={false}
      className='mt-2 flex items-start rounded-md border border-red-300 bg-red-50 p-3 shadow-sm'
      role='alert'
    >
      <div className='flex-shrink-0'>
        <AlertTriangle className='h-5 w-5 text-red-400' aria-hidden='true' />
      </div>
      <div className='ml-3 flex-1'>
        <pre className='m-0 font-mono text-sm text-red-700 whitespace-pre-wrap break-words'>
          {error}
        </pre>
      </div>
    </div>
  );
}
