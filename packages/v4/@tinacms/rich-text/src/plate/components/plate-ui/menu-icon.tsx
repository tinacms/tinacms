import React from 'react';

export const MenuIcon = ({ children }: { children: React.ReactNode }) => (
  <span
    aria-hidden
    className='flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-full'
  >
    {children}
  </span>
);
