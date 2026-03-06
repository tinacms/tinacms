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

function getSafeHref(rawHref: unknown): string {
  if (typeof rawHref !== 'string') return '/';
  const href = rawHref.trim();
  if (!href) return '/';
  // Allow same-origin relative paths and hash links
  if (href.startsWith('/') || href.startsWith('#')) {
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

export const Actions = ({
  parentColor = 'default',
  parentField = '',
  className = '',
  actions,
}: any) => {
  const { theme } = useLayout() as any;

  return (
    <div className={`flex flex-wrap items-center gap-y-4 gap-x-6 ${className}`}>
      {actions &&
        actions.map(function (action: any, index: number) {
          let element = null;
          if (action.type === 'button') {
            element = (
              <Link
                key={index}
                href={getSafeHref(action.link)}
                data-tinafield={`${parentField}.${index}`}
                className={`z-10 relative inline-flex items-center px-7 py-3 font-semibold text-lg transition duration-150 ease-out rounded-lg transform focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 whitespace-nowrap ${
                  parentColor === 'primary'
                    ? invertedButtonColorClasses[
                        theme.color as keyof typeof invertedButtonColorClasses
                      ]
                    : buttonColorClasses[
                        theme.color as keyof typeof buttonColorClasses
                      ]
                }`}
              >
                {action.label}
                {action.icon && (
                  <BiRightArrowAlt
                    className={`ml-1 -mr-1 w-6 h-6 opacity-80`}
                  />
                )}
              </Link>
            );
          } else {
            element = (
              <Link
                key={index}
                href={getSafeHref(action.link)}
                data-tinafield={`${parentField}.${index}`}
                className={`z-10 relative inline-flex items-center px-7 py-3 font-semibold text-lg transition duration-150 ease-out ${
                  parentColor === 'primary'
                    ? linkButtonColorClasses[
                        theme.color as keyof typeof linkButtonColorClasses
                      ]
                    : linkButtonColorClasses[
                        theme.color as keyof typeof linkButtonColorClasses
                      ]
                }`}
              >
                {action.label}
                {action.icon && (
                  <BiRightArrowAlt
                    className={`ml-1 -mr-1 w-6 h-6 opacity-80`}
                  />
                )}
              </Link>
            );
          }

          return element;
        })}
    </div>
  );
};
