import React from 'react';
import { BiMenu } from 'react-icons/bi';
import { useNav } from './nav-context';

interface NavMenuTriggerProps {
  className?: string;
  label?: string;
}

/**
 * A button component that triggers the navigation menu
 * Can be used anywhere within the NavProvider hierarchy
 */
export const NavMenuTrigger: React.FC<NavMenuTriggerProps> = ({
  className = '',
  label = 'Toggle navigation menu',
}) => {
  const { toggleMenu, menuIsOpen } = useNav();

  // Only render when menu is closed
  if (menuIsOpen) {
    return null;
  }

  return (
    <button
      className={`pointer-events-auto p-2 hover:bg-gray-100 transition-colors duration-150 ease-in-out rounded ${className}`}
      onClick={toggleMenu}
      aria-label={label}
      title={label}
    >
      <BiMenu className='h-8 w-auto text-gray-600' />
    </button>
  );
};
