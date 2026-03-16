'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayout } from './layout-context';
import { Container } from './container';
import { Icon } from './icon';
import { cn, sanitizeHref } from '@/lib/utils';
import type { GlobalHeaderNav } from '@/tina/__generated__/types';
import { MobileNavDrawer } from './mobile-nav-drawer';

export const Header = () => {
  const { globalSettings, theme } = useLayout();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const header = globalSettings?.header;
  const nav = header?.nav || [];
  const isPrimary = header?.color === 'primary';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const sanitizeId = (s: string, fallback = 'nav') => {
    const id = String(s || fallback)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return id || fallback;
  };

  return (
    <header
      className={cn(
        'relative overflow-hidden bg-gradient-to-b',
        isPrimary
          ? 'text-white from-theme-500 to-theme-700'
          : 'text-gray-800 dark:text-gray-50 from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000',
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

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className='hidden sm:flex items-center gap-0 sm:gap-1'>
            {nav.map((item: GlobalHeaderNav, idx: number) => {
              const active = isActive(item.href ?? '/');
              const gradientId = sanitizeId(
                item.href ?? `nav-${idx}`,
                `nav-${idx}`
              );
              return (
                <Link
                  key={item.href ?? `nav-${idx}`}
                  href={sanitizeHref(item.href, '/')}
                  className={cn(
                    'relative select-none text-base inline-flex items-center tracking-wide transition duration-150 ease-out opacity-70 hover:opacity-100 px-2 sm:px-4 py-5',
                    active && 'opacity-100',
                    active && (isPrimary
                      ? 'border-b-3 border-white'
                      : 'border-b-3 border-theme-200'),
                    active && !isPrimary && 'text-theme-600 dark:text-theme-300',
                  )}
                >
                  {item.label}
                  {active && (
                    <svg
                      className='absolute bottom-0 left-1/2 w-[180%] h-full -translate-x-1/2 -z-1 opacity-10 dark:opacity-15'
                      preserveAspectRatio='none'
                      viewBox='0 0 230 230'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <defs>
                        <radialGradient id={gradientId}>
                          <stop stopColor='currentColor' />
                          <stop offset='1' stopColor='transparent' />
                        </radialGradient>
                      </defs>
                      <rect
                        x='0'
                        y='0'
                        width='230'
                        height='230'
                        fill={`url(#${gradientId})`}
                      />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation Drawer */}
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
          isPrimary ? 'via-white' : 'via-black dark:via-white',
        )}
      />
    </header>
  );
};
