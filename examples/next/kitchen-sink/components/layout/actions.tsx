'use client';
import Link from 'next/link';
import React from 'react';
import { BiRightArrowAlt } from 'react-icons/bi';
import {
  buttonColorClasses,
  invertedButtonColorClasses,
  linkButtonColorClasses,
  sanitizeHref,
} from '@/lib/utils';
import { tinaField } from 'tinacms/dist/react';
import { useLayout } from './layout-context';

export interface NavAction {
  label?: string | null;
  type?: string | null;
  link?: string | null;
  icon?: boolean | null;
}


interface ActionsProps {
  parentColor?: string | null;
  className?: string;
  actions?: Array<NavAction | null>;
}

export const Actions = ({
  parentColor = 'default',
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
              href={sanitizeHref(action.link, '/')}
              data-tina-field={tinaField(action)}
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
