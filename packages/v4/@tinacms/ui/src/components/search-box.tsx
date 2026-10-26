import type { LucideIcon } from 'lucide-react';
import { type ComponentProps, useId } from 'react';

import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@tinacms/ui/components/input-group';
import { KbdShortcut, keyShortcuts } from '@tinacms/ui/components/kbd';
import { cn } from '@tinacms/ui/lib/utils';

type SearchBoxProps = Omit<
  ComponentProps<'input'>,
  'size' | 'type' | 'value' | 'defaultValue'
> & {
  /** What the box searches, such as "Search titles". Screen readers read it; it is not shown. */
  label: string;
  /** Defaults to the label. */
  placeholder?: string;
  icon?: Glyph | LucideIcon;
  /** md is 32px high; sm is 28px, for a panel header. */
  size?: 'md' | 'sm';
  /** Keys shown at the end, such as `/` or `⌘K`. */
  shortcut?: string;
} & (
    | {
        value: string;
        /** Shows a Clear button while the box has a value. */
        onClear?: () => void;
      }
    | { value?: undefined; defaultValue?: string; onClear?: never }
  );

/**
 * The admin's search and filter box. Content that an editor writes is a
 * string field, not a SearchBox.
 */
function SearchBox({
  label,
  placeholder,
  icon = 'search',
  size = 'md',
  shortcut,
  onClear,
  id,
  className,
  value,
  ...props
}: SearchBoxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div
      data-slot='search-box'
      className={cn('relative w-full min-w-0', className)}
    >
      <label htmlFor={inputId} className='sr-only'>
        {label}
      </label>
      <InputGroup size={size}>
        <InputGroupAddon>
          <Icon glyph={icon} size={16} className='size-4' />
        </InputGroupAddon>
        <InputGroupInput
          id={inputId}
          type='search'
          value={value}
          autoComplete='off'
          spellCheck={false}
          placeholder={placeholder || label}
          aria-keyshortcuts={shortcut ? keyShortcuts(shortcut) : undefined}
          className='[&::-webkit-search-cancel-button]:hidden'
          {...props}
        />
        {onClear && value ? (
          <InputGroupAddon align='inline-end'>
            <InputGroupButton
              size='icon-xs'
              aria-label='Clear search'
              onClick={onClear}
            >
              <Icon glyph='close' size={12} className='size-3' />
            </InputGroupButton>
          </InputGroupAddon>
        ) : shortcut ? (
          <InputGroupAddon align='inline-end'>
            <KbdShortcut keys={shortcut} size={size} />
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </div>
  );
}

export type { SearchBoxProps };
export { SearchBox };
