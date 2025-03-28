import { Button } from '@toolkit/styles';
import * as React from 'react';

export const SidebarNoFormsPlaceholder = () => (
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
    <p className='block pb-5'>
      Looks like there's <br />
      nothing to edit on <br />
      this page.
    </p>
    <p className='block pt-5'>
      <Button
        href='https://tina.io/docs/contextual-editing/overview'
        target='_blank'
        as='a'
      >
        <Emoji className='mr-1.5'>📖</Emoji> Contextual Editing Docs
      </Button>
    </p>
  </div>
);

const Emoji = ({ className = '', ...props }) => (
  <span
    className={`text-[24px] leading-none inline-block ${className}`}
    {...props}
  />
);
