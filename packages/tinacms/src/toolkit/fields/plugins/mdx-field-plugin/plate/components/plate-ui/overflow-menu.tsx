import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useOpenState,
} from '../plate-ui/dropdown-menu';
import { ToolbarButton } from './toolbar';
import { Icons } from './icons';

type OverflowMenuProps = {
  [key: string]: any;
  children: React.ReactNode[];
};
export default function OverflowMenu({
  children,
  ...props
}: OverflowMenuProps) {
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          showArrow={false}
          data-testid='rich-text-editor-overflow-menu-button'
          isDropdown
          pressed={openState.open}
          tooltip='More tools...'
        >
          <Icons.overflow className='size-5' />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='min-w-0 flex flex-grow'>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
