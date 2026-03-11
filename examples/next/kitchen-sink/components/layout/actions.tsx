'use client';
import Link from 'next/link';
import React from 'react';
import { BiRightArrowAlt } from 'react-icons/bi';
import {
  buttonColorClasses,
  invertedButtonColorClasses,
  linkButtonColorClasses,
} from '@/lib/utils';
import { useLayout } from './layout-context';

export interface NavAction {
  label?: string | null;
  type?: string | null;
  link?: string | null;
  icon?: boolean | null;
}

function getSafeHref(rawHref: unknown): string {
  if (typeof rawHref !== 'string') return '/';
  const href = rawHref.trim();
  if (!href) return '/';
  // Allow same-origin relative paths and hash links
  // Explicitly reject protocol-relative URLs like //evil.com
  if (
    (href.startsWith('/') &&
      !href.startsWith('//') &&
      !href.startsWith('\\')) ||
    href.startsWith('#')
  ) {
    return href;
  }
  // Allow http/https absolute URLs
  try {
    const url = new URL(href);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    // not a valid absolute URL
  }
  return '/';
}

interface ActionsProps {
  parentColor?: string | null;
  parentField?: string;
  className?: string;
  actions?: Array<NavAction | null>;
}

export const Actions = ({
  parentColor = 'default',
  parentField = '',
  className = '',
  actions,
}: ActionsProps) => {
  const { theme } = useLayout();

  return (
    <div className={`flex flex-wrap items-center gap-y-4 gap-x-6 ${className}`}>
      {actions &&
        actions.map(function (action, index: number) {
          if (!action) return null;
          const isButton = action.type === 'button';
          const colorClass = isButton
            ? parentColor === 'primary'
              ? invertedButtonColorClasses[
                  theme.color as keyof typeof invertedButtonColorClasses
                ]
              : buttonColorClasses[
                  theme.color as keyof typeof buttonColorClasses
                ]
            : linkButtonColorClasses[
                theme.color as keyof typeof linkButtonColorClasses
              ];

          return (
            <Link
              key={index}
              href={getSafeHref(action.link)}
              data-tinafield={`${parentField}.${index}`}
              className={`z-10 relative inline-flex items-center px-7 py-3 font-semibold text-lg transition duration-150 ease-out ${
                isButton
                  ? 'rounded-lg transform focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 whitespace-nowrap'
                  : ''
              } ${colorClass}`}
            >
              {action.label}
              {action.icon && (
                <BiRightArrowAlt className={`ml-1 -mr-1 w-6 h-6 opacity-80`} />
              )}
            </Link>
          );
        })}
    </div>
  );
};
