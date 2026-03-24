import React, { useState } from 'react';
import { Container } from './container';
import { Icon } from './icon';
import { cn } from '@/lib/utils';
import { DesktopNav } from './desktop-nav';
import { MobileNavDrawer } from './mobile-nav-drawer';

interface NavItem {
  href?: string | null;
  label?: string | null;
}

interface HeaderProps {
  name?: string;
  color?: string;
  nav?: Array<NavItem | null>;
  themeColor?: string;
  pathname: string;
}

export const Header = ({
  name,
  color,
  nav = [],
  themeColor = 'blue',
  pathname,
}: HeaderProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isPrimary = color === 'primary';

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
            <a
              href='/'
              className='flex items-center gap-1 whitespace-nowrap tracking-[.002em]'
            >
              <Icon
                data={{
                  name: 'Tina',
                  color: isPrimary ? 'primary' : themeColor,
                  style: 'float',
                }}
                parentThemeColor={themeColor}
                className='inline-block h-auto w-10 opacity-80 hover:opacity-100'
              />
              <span className='hidden sm:inline'>
                {name || 'Tina Kitchen Sink'}
              </span>
            </a>
          </h4>

          <DesktopNav nav={nav} isPrimary={isPrimary} pathname={pathname} />

          <MobileNavDrawer
            nav={nav}
            isOpen={mobileNavOpen}
            onOpen={() => setMobileNavOpen(true)}
            onClose={() => setMobileNavOpen(false)}
            pathname={pathname}
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
