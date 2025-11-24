import * as React from 'react';
import { BiMenu } from 'react-icons/bi';
import { cn } from '../../../utils/cn';
import { useNavContext } from './nav-context';

interface NavTriggerProps {
  className?: string;
}

export function NavTrigger({ className }: NavTriggerProps) {
  const { toggleNav } = useNavContext();

  return (
    <button
      className={cn(
        'pointer-events-auto p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded',
        className
      )}
      onClick={toggleNav}
      aria-label='Toggle navigation menu'
    >
      <BiMenu className='h-6 w-auto text-gray-600' />
    </button>
  );
}
