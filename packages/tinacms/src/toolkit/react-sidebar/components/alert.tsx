import * as React from 'react';
import { AiFillWarning } from 'react-icons/ai';
import { cn } from '../../../lib/utils';

export const Alert = ({
  children,
  alertStyle = 'warning',
  className = '',
  ...props
}: {
  children?: React.ReactNode;
  alertStyle?: 'warning';
} & React.HTMLProps<HTMLDivElement>) => {
  const styles = {
    warning:
      'ml-8 text-sm px-4 py-2 text-amber-700 bg-amber-100 rounded border border-amber-700/20',
  };

  const icon = {
    warning: (
      <AiFillWarning className='w-5 h-auto inline-block mr-1 opacity-70 text-amber-600' />
    ),
  };

  return (
    <div className={cn(styles[alertStyle], className)} {...props}>
      {icon[alertStyle]} {children}
    </div>
  );
};
