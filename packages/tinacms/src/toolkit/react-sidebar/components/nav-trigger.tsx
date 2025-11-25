import * as React from 'react';
import { BiMenu } from 'react-icons/bi';
import { cn } from '../../../utils/cn';
import { SheetTrigger } from '../../components/ui/sheet';

interface NavTriggerProps {
  className?: string;
}

export function NavTrigger({ className }: NavTriggerProps) {
  return (
    <SheetTrigger asChild>
      <button
        className={cn(
          'pointer-events-auto p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded',
          className
        )}
        aria-label='Toggle navigation menu'
      >
        <BiMenu size={24} color='#4B5563' />
      </button>
    </SheetTrigger>
  );
}
