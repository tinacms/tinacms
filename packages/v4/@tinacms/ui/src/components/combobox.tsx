'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { cn } from '@tinacms/ui/lib/utils';
import * as React from 'react';

import { Button } from '@tinacms/ui/components/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@tinacms/ui/components/input-group';
import {
  selectListClassName,
  selectOptionClassName,
} from '@tinacms/ui/lib/field-styles';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';

const Combobox = ComboboxPrimitive.Root;

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot='combobox-value' {...props} />;
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot='combobox-trigger'
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className='pointer-events-none size-3.5 text-muted-foreground transition-transform in-data-popup-open:rotate-180' />
    </ComboboxPrimitive.Trigger>
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot='combobox-clear'
      aria-label='Clear'
      render={<InputGroupButton variant='ghost' size='icon-xs' />}
      className={cn(className)}
      {...props}
    >
      <XIcon aria-hidden='true' className='pointer-events-none' />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  triggerTabbable = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  /** Set false when the input itself opens the list, so Tab skips the chevron. */
  triggerTabbable?: boolean;
  showClear?: boolean;
}) {
  return (
    <InputGroup className={cn('w-auto pr-1', className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon
        align='inline-end'
        className='group-has-[[data-slot=input-group-control][data-readonly]]/input-group:hidden'
      >
        {showTrigger && (
          <InputGroupButton
            size='icon-xs'
            variant='ghost'
            render={
              <ComboboxTrigger tabIndex={triggerTabbable ? undefined : -1} />
            }
            data-slot='input-group-button'
            className='group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent'
            disabled={disabled}
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} tabIndex={0} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className='isolate z-50'
      >
        <ComboboxPrimitive.Popup
          data-slot='combobox-content'
          data-chips={!!anchor}
          className={cn(
            selectListClassName,
            'group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden p-0 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot='combobox-list'
      className={cn(
        'no-scrollbar max-h-[min(--spacing(80),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0',
        className
      )}
      {...props}
    />
  );
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot='combobox-item'
      className={cn(selectOptionClassName, className)}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className='pointer-events-none absolute right-2 flex size-4 items-center justify-center' />
        }
      >
        <CheckIcon className='pointer-events-none size-3.5' />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot='combobox-group'
      className={cn(className)}
      {...props}
    />
  );
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot='combobox-label'
      className={cn(
        'px-2 py-1.5 font-sans text-xs leading-4 text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot='combobox-collection' {...props} />
  );
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot='combobox-empty'
      className={cn(
        'hidden w-full justify-center py-2 text-center font-sans text-sm text-muted-foreground group-data-empty/combobox-content:flex',
        className
      )}
      {...props}
    />
  );
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot='combobox-separator'
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot='combobox-chips'
      className={cn(
        'flex min-h-8 flex-wrap items-center gap-1 rounded-sm border border-input bg-card px-2.5 py-1 font-sans text-base text-foreground transition-[border-color,box-shadow] hover:border-input-hover focus-within:border-ring focus-within:shadow-focus-field has-aria-invalid:border-destructive has-data-[slot=combobox-chip]:px-1',
        className
      )}
      {...props}
    />
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot='combobox-chip'
      className={cn(
        'flex h-5.5 w-fit items-center justify-center gap-1 rounded-xs bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0',
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant='icon' size='sm' className='size-6' />}
          className='-ml-1 opacity-50 hover:opacity-100'
          data-slot='combobox-chip-remove'
        >
          <XIcon className='pointer-events-none' />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot='combobox-chip-input'
      className={cn(
        'min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
