import * as React from 'react';
import { cn } from '@utils/cn';
import { MdCheckCircle, MdError, MdInfo, MdWarning } from 'react-icons/md';

export const Callout = ({
  children,
  calloutStyle = 'warning',
  className = '',
  ...props
}: {
  children?: React.ReactNode;
  calloutStyle?: 'warning' | 'info' | 'critical';
} & React.HTMLProps<HTMLDivElement>) => {
  const commonAlertStyles =
    'text-sm px-4 py-3 rounded-md border-2 font bg-white text-gray-700 font-medium';

  const styles = {
    warning: `border-amber-700/20`,
    info: `border-blue-600/20`,
    critical: `border-red-600/20`,
  };

  const icon = {
    warning: (
      <MdWarning className='w-5 h-auto inline-block mr-1 opacity-70 text-amber-600' />
    ),
    info: (
      <MdInfo className='w-5 h-auto inline-block mr-1 opacity-70 text-[#1D4ED8]' />
    ),
    critical: (
      <MdError className='w-5 h-auto inline-block mr-1 opacity-70 text-red-600' />
    ),
  };

  return (
    <div
      className={cn(commonAlertStyles, styles[calloutStyle], className)}
      {...props}
    >
      {icon[calloutStyle]} {children}
    </div>
  );
};
