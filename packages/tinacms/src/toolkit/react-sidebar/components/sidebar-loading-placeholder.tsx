import { LoadingMessage } from '@toolkit/components/loading-messages';
import { LoadingDots } from '@toolkit/form-builder';
import * as React from 'react';

export const SidebarLoadingPlaceholder = () => (
  <div
    className='relative flex flex-col items-center justify-center text-center p-5 pb-16 w-full h-full overflow-y-auto'
    style={{
      animationName: 'fade-in',
      animationDelay: '300ms',
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'both',
      animationDuration: '150ms',
    }}
  >
    <LoadingMessage className='block pb-5' />
    <LoadingDots color={'var(--tina-color-primary)'} />
  </div>
);
