import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Transition,
} from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import React, { Fragment } from 'react';
import { classNames } from './helpers';

interface AutocompleteItem {
  key: string;
  label: string;
  render: (item: Omit<AutocompleteItem, 'render'>) => string | JSX.Element;
}

interface AutocompleteProps {
  value: Omit<AutocompleteItem, 'render'>;
  defaultQuery?: string;
  onChange: (item: AutocompleteItem) => void;
  items: AutocompleteItem[];
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  defaultQuery,
  items,
}) => {
  const [query, setQuery] = React.useState(defaultQuery ?? '');
  const filteredItems = React.useMemo(() => {
    try {
      const reFilter = new RegExp(query, 'i');
      const _items = items.filter((item) => reFilter.test(item.label));
      if (_items.length === 0) return items;
      return _items;
    } catch (err) {
      return items;
    }
  }, [items, query]);

  return (
    <Combobox
      value={value}
      onChange={onChange}
      as='div'
      className='relative inline-block text-left z-20'
    >
      <div className='mt-1'>
        <div className='relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md sm:text-sm'>
          <ComboboxInput
            className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300'
            displayValue={(item: AutocompleteItem) =>
              item?.label ?? 'Plain Text'
            }
            onChange={(event) => setQuery(event.target.value)}
            onClick={(ev) => ev.stopPropagation()}
          />
          <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
            <ChevronDownIcon
              className='h-5 w-5 text-gray-400'
              aria-hidden='true'
            />
          </ComboboxButton>
        </div>
      </div>
      <Transition
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <ComboboxOptions className='origin-top-right absolute right-0 mt-1 w-full max-h-[300px] overflow-y-auto rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
          {filteredItems.map((item) => (
            <ComboboxOption key={item.key} value={item}>
              {({ focus }) => (
                <button
                  className={classNames(
                    focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block px-4 py-2 text-xs w-full text-right'
                  )}
                >
                  {item.render(item)}
                </button>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Transition>
    </Combobox>
  );
};
