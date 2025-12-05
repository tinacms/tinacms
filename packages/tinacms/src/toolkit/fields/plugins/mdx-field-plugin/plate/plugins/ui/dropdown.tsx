import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import React from 'react';
import { classNames } from './helpers';

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
    <Menu as='div' className='relative inline-block text-left z-20'>
      <div>
        <MenuButton className='inline-flex justify-center w-full rounded border border-gray-300 shadow-sm px-2 py-1 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-tina-orange-dark'>
          {label}
          <ChevronDownIcon className='-mr-1 ml-2 h-4 w-4' aria-hidden='true' />
        </MenuButton>
      </div>

      <Transition
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <MenuItems className='origin-top-right absolute right-0 mt-2 w-32 max-h-[200px] overflow-y-auto rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
          <div className='py-1'>
            {items.map((item) => (
              <MenuItem key={item.key}>
                {({ focus }) => (
                  <button
                    onClick={item.onClick}
                    className={classNames(
                      focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-xs w-full text-right'
                    )}
                  >
                    {item.render}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
