import * as React from 'react';
import { AiFillWarning } from 'react-icons/ai';
import { cn } from '../../../lib/utils';
import { MdInfo } from 'react-icons/md';

export const Alert = ({
  children,
  alertStyle = 'warning',
  className = '',
  ...props
}: {
  children?: React.ReactNode;
  alertStyle?: 'warning' | 'info';
} & React.HTMLProps<HTMLDivElement>) => {
  const commonAlertStyles = 'ml-8 text-sm px-4 py-2 rounded-md border';

  const styles = {
    warning:
      ` text-amber-700 bg-amber-100 border-amber-700/20`,
    info:
      ` text-[#2563EB] bg-[#1C4ED8]/20 border-[#2563EB]/20`,
  };

  const icon = {
    warning: (
      <AiFillWarning className='w-5 h-auto inline-block mr-1 opacity-70 text-amber-600' />
    ),
    info: (
      <MdInfo className='w-5 h-auto inline-block mr-1 opacity-70 text-[#2563EB]' />
    ),
  };

  return (
    <div className={cn(commonAlertStyles, styles[alertStyle], className)} {...props}>
      {icon[alertStyle]} {children}
    </div>
  );
};
