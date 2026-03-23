import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn, sanitizeHref } from '@/src/lib/utils';

interface DesktopNavProps {
  nav: Array<{ href?: string; label?: string } | null>;
  isPrimary: boolean;
}

export const DesktopNav = ({ nav, isPrimary }: DesktopNavProps) => {
  const { pathname } = useLocation();

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
            to={sanitizeHref(item.href, '/')}
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
          </Link>
        );
      })}
    </nav>
  );
};
