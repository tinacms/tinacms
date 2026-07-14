import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@toolkit/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import React from 'react';

export function Dropdown({
  label,
  items,
}: {
  label: string | JSX.Element;
  items: {
    key: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    render: string | JSX.Element;
  }[];
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className='inline-flex justify-center w-full rounded border border-gray-300 shadow-sm px-2 py-1 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500'>
        {label}
        <ChevronDown className='-mr-1 ml-2 h-4 w-4' aria-hidden='true' />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='w-32 max-h-[200px] overflow-y-auto py-1 rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'
      >
        {items.map((item) => (
          // asChild keeps the real <button>, so item.onClick still gets a MouseEvent.
          // Radix marks the hovered/keyboard-focused item with data-highlighted,
          // which replaces Headless UI's `focus` render prop.
          <DropdownMenuItem key={item.key} asChild>
            <button
              type='button'
              onClick={item.onClick}
              className='block px-4 py-2 text-xs w-full text-right cursor-pointer text-gray-700 data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900'
            >
              {item.render}
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
