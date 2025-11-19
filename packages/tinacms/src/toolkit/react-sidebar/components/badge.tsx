import * as React from 'react';
import { AiFillWarning } from 'react-icons/ai';
import { cn } from '../../../lib/utils';
import {
  MdAccessTime,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdOutlineDataSaverOff,
  MdWifiOff,
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

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
    'ml-8 text-xs px-2 py-0.5 flex items-center rounded-md border';

  const styles = {
    warning: `text-amber-700 bg-amber-100 border-amber-700/20`,
    info: `text-blue-600 bg-blue-100/50 border-blue-600/20`,
    success: `text-green-600 bg-green-100/50 border-green-600/20`,
    error: `text-red-700 bg-red-100/50 border-red-700/20`,
  };

  const icon = {
    warning: (
      <MdAccessTime className='w-5 h-auto inline-block mr-1 opacity-70 text-amber-600' />
    ),
    info: (
      <MdOutlineDataSaverOff className='w-5 h-auto inline-block mr-1 opacity-70 text-blue-600' />
    ),
    success: (
      <MdCheckCircle className='w-5 h-auto inline-block mr-1 opacity-70 text-green-600' />
    ),
    error: (
      <MdWifiOff className='w-5 h-auto inline-block mr-1 opacity-70 text-red-700' />
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
