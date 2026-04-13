'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLayout } from './layout-context';
import { Container } from './container';
import { Icon } from './icon';
import { cn } from '@/lib/utils';
import { DesktopNav } from './desktop-nav';
import { MobileNavDrawer } from './mobile-nav-drawer';

export const Header = () => {
  const { globalSettings, theme } = useLayout();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const header = globalSettings?.header;
  const nav = header?.nav || [];
  const isPrimary = header?.color === 'primary';

  return (
    <header
      className={cn(
        'relative overflow-hidden bg-gradient-to-b',
        isPrimary
          ? 'text-white from-theme-500 to-theme-700'
          : 'text-gray-800 dark:text-gray-50 from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000'
      )}
    >
      <Container size='custom' className='py-0 relative z-10'>
        <div className='flex items-center justify-between gap-4'>
          <h4 className='select-none text-lg font-bold tracking-tight my-4 transition duration-150 ease-out transform'>
            <Link
              href='/'
              className='flex items-center gap-1 whitespace-nowrap tracking-[.002em]'
            >
              <Icon
                data={{
                  name: 'Tina',
                  color: isPrimary ? 'primary' : theme.color,
                  style: 'float',
                }}
                className='inline-block h-auto w-10 opacity-80 hover:opacity-100'
              />
              <span className='hidden sm:inline'>
                {header?.name || 'Tina Kitchen Sink'}
              </span>
            </Link>
          </h4>

          <DesktopNav nav={nav} isPrimary={isPrimary} />

          <MobileNavDrawer
            nav={nav}
            isOpen={mobileNavOpen}
            onOpen={() => setMobileNavOpen(true)}
            onClose={() => setMobileNavOpen(false)}
          />
        </div>
      </Container>
      <div
        className={cn(
          'absolute h-1 bg-gradient-to-r from-transparent to-transparent bottom-0 left-4 right-4 opacity-5',
          isPrimary ? 'via-white' : 'via-black dark:via-white'
        )}
      />
    </header>
  );
};
