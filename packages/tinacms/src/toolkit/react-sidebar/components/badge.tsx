import { cn } from '@utils/cn';
import { CircleCheck, Clock, Info, WifiOff } from 'lucide-react';
import * as React from 'react';

export const Badge = ({
  children,
  calloutStyle = 'warning',
  className = '',
  displayIcon = true,
  ...props
}: {
  children?: React.ReactNode;
  calloutStyle?: 'warning' | 'info' | 'success' | 'error';
  displayIcon?: boolean;
} & React.HTMLProps<HTMLDivElement>) => {
  const commonAlertStyles =
    'text-xs px-2 py-0.5 flex items-center rounded-md border';

  const styles = {
    warning: `text-amber-700 bg-amber-100 border-amber-700/20`,
    info: `text-blue-600 bg-blue-100/50 border-blue-600/20`,
    success: `text-green-600 bg-green-100/50 border-green-600/20`,
    error: `text-red-700 bg-red-100/50 border-red-700/20`,
  };

  const icon = {
    warning: (
      <Clock className='w-5 h-auto inline-block mr-1 opacity-70 text-amber-600' />
    ),
    info: (
      <Info className='w-5 h-auto inline-block mr-1 opacity-70 text-blue-600' />
    ),
    success: (
      <CircleCheck className='w-5 h-auto inline-block mr-1 opacity-70 text-green-600' />
    ),
    error: (
      <WifiOff className='w-5 h-auto inline-block mr-1 opacity-70 text-red-700' />
    ),
  };

  return (
    <div
      className={cn(commonAlertStyles, styles[calloutStyle], className)}
      {...props}
    >
      {displayIcon && icon[calloutStyle]} {children}
    </div>
  );
};
