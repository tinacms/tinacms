'use client';
import Link from 'next/link';
import React from 'react';
import { BiRightArrowAlt } from 'react-icons/bi';
import { cn } from '@/lib/utils';
import { tinaField } from 'tinacms/dist/react';

interface NavAction {
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
  return (
    <div
      className={cn('flex flex-wrap items-center gap-y-4 gap-x-6', className)}
    >
      {actions?.map((action, index) => {
        if (!action) return null;
        const isButton = action.type === 'button';
        const isPrimary = parentColor === 'primary';

        const colorClass = isButton
          ? isPrimary
            ? 'text-theme-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100'
            : 'text-theme-on bg-theme-500 hover:bg-theme-600 bg-gradient-to-r from-theme-400 to-theme-600 hover:from-theme-400 hover:to-theme-500'
          : 'text-theme-600 dark:text-theme-400 hover:text-theme-400 dark:hover:text-theme-200';

        return (
          <Link
            key={index}
            href={action.link || '/'}
            data-tina-field={tinaField(action as Record<string, unknown>)}
            className={cn(
              'z-10 relative inline-flex items-center px-7 py-3 font-semibold text-lg transition duration-150 ease-out',
              isButton &&
                'rounded-lg transform focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 whitespace-nowrap',
              colorClass
            )}
          >
            {action.label}
            {action.icon && (
              <BiRightArrowAlt className='ml-1 -mr-1 w-6 h-6 opacity-80' />
            )}
          </Link>
        );
      })}
    </div>
  );
};
