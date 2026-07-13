import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@toolkit/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import React from 'react';

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

/**
 * Was a Headless UI <Combobox>. Rebuilt on the Radix popover we already ship:
 * the input doubles as the filter and the popover anchor, and the chevron is
 * the explicit trigger.
 */
export const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  defaultQuery,
  items,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(defaultQuery ?? '');

  const displayValue = value?.label ?? 'Plain Text';

  // When the selection changes elsewhere, mirror it back into the input.
  React.useEffect(() => {
    setQuery('');
  }, [value?.key]);

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

  const select = (item: AutocompleteItem) => {
    onChange(item);
    setQuery('');
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery('');
        }
      }}
    >
      <div className='mt-1'>
        <div className='relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md sm:text-sm'>
          <PopoverAnchor asChild>
            <input
              className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300'
              value={open ? query : displayValue}
              placeholder={displayValue}
              onFocus={() => setOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onClick={(ev) => ev.stopPropagation()}
            />
          </PopoverAnchor>
          <PopoverTrigger className='absolute inset-y-0 right-0 flex items-center pr-2'>
            <ChevronDown className='h-5 w-5 text-gray-400' aria-hidden='true' />
          </PopoverTrigger>
        </div>
      </div>
      <PopoverContent
        align='end'
        sideOffset={4}
        // Keep the caret in the input so typing keeps filtering.
        onOpenAutoFocus={(event) => event.preventDefault()}
        className='w-[--radix-popover-trigger-width] min-w-[12rem] max-h-[300px] overflow-y-auto p-0 rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'
      >
        {filteredItems.map((item) => (
          <button
            key={item.key}
            type='button'
            onClick={() => select(item)}
            className='block px-4 py-2 text-xs w-full text-right text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none'
          >
            {item.render(item)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};
