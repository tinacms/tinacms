'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, sanitizeHref } from '@/lib/utils';
import type { GlobalHeaderNav } from '@/tina/__generated__/types';

interface DesktopNavProps {
  nav: Array<GlobalHeaderNav | null>;
  isPrimary: boolean;
}

export const DesktopNav = ({ nav, isPrimary }: DesktopNavProps) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <nav className='hidden sm:flex items-center gap-0 sm:gap-1'>
      {nav.map((item, idx) => {
        if (!item) return null;
        const active = isActive(item.href ?? '/');
        return (
          <Link
            key={item.href ?? `nav-${idx}`}
            href={sanitizeHref(item.href, '/')}
            className={cn(
              'relative select-none text-base inline-flex items-center tracking-wide transition duration-150 ease-out opacity-70 hover:opacity-100 px-2 sm:px-4 py-5',
              active && 'opacity-100',
              active &&
                (isPrimary
                  ? 'border-b-3 border-white'
                  : 'border-b-3 border-theme-200'),
              active && !isPrimary && 'text-theme-600 dark:text-theme-300'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
