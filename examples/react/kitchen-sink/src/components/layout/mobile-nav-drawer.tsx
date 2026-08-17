import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BiMenu, BiX } from 'react-icons/bi';
import { cn, sanitizeHref } from '@/src/lib/utils';

interface MobileNavDrawerProps {
  nav: Array<{ href?: string; label?: string } | null>;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const MobileNavDrawer = ({
  nav,
  isOpen,
  onClose,
  onOpen,
}: MobileNavDrawerProps) => {
  const { pathname } = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <>
      <button
        onClick={() => (isOpen ? onClose() : onOpen())}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls='mobile-nav-menu'
        className='sm:hidden relative h-12 w-12 flex-shrink-0 inline-flex items-center justify-center rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors'
      >
        {isOpen ? (
          <BiX className='h-6 w-6' aria-hidden='true' />
        ) : (
          <BiMenu className='h-6 w-6' aria-hidden='true' />
        )}
      </button>

      {isOpen && (
        <div
          className='fixed inset-0 bg-black/20 dark:bg-black/50 z-30 sm:hidden'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      <nav
        id='mobile-nav-menu'
        aria-label='Mobile navigation'
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-40 sm:hidden transform transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'>
          <span className='text-lg font-bold text-gray-900 dark:text-white'>
            Menu
          </span>
          <button
            onClick={onClose}
            aria-label='Close navigation menu'
            className='h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
          >
            <BiX className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>

        <div className='px-4 py-6 space-y-2'>
          {nav.map((item, idx) => {
            if (!item) return null;
            const active = isActive(item.href ?? '/');
            const href = sanitizeHref(item.href, '/');
            const isStaticOrExternal =
              href.includes('.') || href.startsWith('http');
            const className = cn(
              'block px-4 py-3 rounded-md text-base font-medium transition-colors',
              active
                ? 'text-theme-600 dark:text-theme-400 bg-theme-50 dark:bg-theme-700/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            );

            if (isStaticOrExternal) {
              return (
                <a
                  key={item.href ?? `nav-${idx}`}
                  href={href}
                  onClick={onClose}
                  className={className}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.href ?? `nav-${idx}`}
                to={href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={className}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
