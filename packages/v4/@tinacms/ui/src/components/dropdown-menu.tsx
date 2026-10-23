import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import type { LucideIcon } from 'lucide-react';
import type * as React from 'react';

import { Avatar } from '@tinacms/ui/components/avatar';
import { type Glyph, Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

const ROW =
  'relative box-border flex min-h-9 w-full cursor-default items-center gap-2.5 rounded-sm px-2.5 py-0 font-sans text-base leading-control text-foreground no-underline outline-none select-none focus-visible:shadow-focus-inset data-highlighted:bg-muted data-disabled:text-muted-foreground data-disabled:data-highlighted:bg-transparent';

const DESTRUCTIVE =
  'data-[variant=destructive]:not-data-disabled:text-destructive data-[variant=destructive]:not-data-disabled:data-highlighted:bg-status-failed-subtle';

type RowExtras = {
  /** An icon before the words. */
  icon?: Glyph | LucideIcon;
  /** Small grey words at the end, such as where a new item goes ("in Docs"), or why a greyed item is off. */
  hint?: string;
};

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot='dropdown-menu' {...props} />;
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot='dropdown-menu-portal' {...props} />;
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot='dropdown-menu-trigger' {...props} />;
}

/**
 * The menu card, 264px wide. Base UI handles the keyboard: the arrow keys move and wrap,
 * Home and End jump, Enter or Space picks, and Escape closes and returns focus to the trigger.
 * Give it an `aria-label`.
 */
function DropdownMenuContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className='isolate z-50 outline-none'
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot='dropdown-menu-content'
          className={cn(
            'z-50 box-border max-h-(--available-height) w-66 max-w-(--available-width) min-w-60 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover p-1 font-sans text-base leading-control text-foreground shadow-popover outline-none',
            'transition-[opacity,scale] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot='dropdown-menu-group' {...props} />;
}

/** A group's heading. Place it first inside a DropdownMenuGroup. */
function DropdownMenuLabel({
  className,
  ...props
}: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot='dropdown-menu-label'
      className={cn(
        'px-2.5 py-1.5 text-xs font-medium text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function RowLead({
  icon,
  children,
}: {
  icon?: Glyph | LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <>
      {icon ? <Icon glyph={icon} size={16} className='size-4' /> : null}
      <span className='min-w-0 flex-1 truncate'>{children}</span>
    </>
  );
}

function RowHint({ hint }: { hint?: string }) {
  return hint ? (
    <span className='min-w-0 truncate text-xs text-muted-foreground'>
      {hint}
    </span>
  ) : null;
}

/**
 * An action. A `destructive` item, for one that throws something away, has red words, the trash
 * icon unless `icon` gives another, and a pale red fill when highlighted. Greyed items stay in
 * place and the arrow keys skip them.
 */
function DropdownMenuItem({
  className,
  variant = 'default',
  icon,
  hint,
  children,
  ...props
}: MenuPrimitive.Item.Props &
  RowExtras & {
    variant?: 'default' | 'destructive';
  }) {
  return (
    <MenuPrimitive.Item
      data-slot='dropdown-menu-item'
      data-variant={variant}
      className={cn(ROW, DESTRUCTIVE, className)}
      {...props}
    >
      <RowLead icon={icon ?? (variant === 'destructive' ? 'trash' : undefined)}>
        {children}
      </RowLead>
      <RowHint hint={hint} />
    </MenuPrimitive.Item>
  );
}

/** An item that opens `href` in a new tab. Screen readers hear "(opens in a new tab)". */
function DropdownMenuLinkItem({
  className,
  children,
  ...props
}: Omit<MenuPrimitive.LinkItem.Props, 'target' | 'rel'> & { href: string }) {
  return (
    <MenuPrimitive.LinkItem
      data-slot='dropdown-menu-link-item'
      target='_blank'
      rel='noopener'
      className={cn(ROW, className)}
      {...props}
    >
      <span className='min-w-0 flex-1 truncate'>
        {children}
        <span className='sr-only'> (opens in a new tab)</span>
      </span>
      <Icon
        glyph='external'
        size={13}
        className='size-3.25 text-muted-foreground'
      />
    </MenuPrimitive.LinkItem>
  );
}

/** An on or off choice, with a tick at the end while it is on. Picking it closes the menu. */
function DropdownMenuCheckboxItem({
  className,
  children,
  icon,
  hint,
  closeOnClick = true,
  ...props
}: MenuPrimitive.CheckboxItem.Props & RowExtras) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot='dropdown-menu-checkbox-item'
      className={cn(ROW, 'pr-8', className)}
      closeOnClick={closeOnClick}
      {...props}
    >
      <RowLead icon={icon}>{children}</RowLead>
      <RowHint hint={hint} />
      <span
        className='pointer-events-none absolute right-2.5 flex items-center justify-center'
        data-slot='dropdown-menu-checkbox-item-indicator'
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <Icon glyph='check' size={16} className='size-4' />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
    </MenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot='dropdown-menu-separator'
      className={cn('-mx-1 my-1 h-px bg-border-subtle', className)}
      {...props}
    />
  );
}

/** Small grey words that nobody picks, such as the version number. */
function DropdownMenuNote({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='dropdown-menu-note'
      className={cn('px-2.5 py-1.5 text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

/** The signed-in person at the top of the account menu. */
function DropdownMenuPerson({
  name,
  sub,
  initials,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  name: string;
  sub?: string;
  initials?: string;
}) {
  return (
    <div
      data-slot='dropdown-menu-person'
      className={cn('flex items-center gap-2.5 px-2.5 py-2', className)}
      {...props}
    >
      <Avatar as='static' name={name} initials={initials} />
      <div className='flex min-w-0 flex-col'>
        <span className='truncate font-semibold'>{name}</span>
        {sub ? (
          <span className='truncate text-xs text-muted-foreground'>{sub}</span>
        ) : null}
      </div>
    </div>
  );
}

/** A bold heading with an optional line under it, such as "Local files" in local mode. */
function DropdownMenuHeading({
  heading,
  sub,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  heading: string;
  sub?: string;
}) {
  return (
    <div
      data-slot='dropdown-menu-heading'
      className={cn('flex flex-col gap-0.5 px-2.5 py-2', className)}
      {...props}
    >
      <span className='font-semibold'>{heading}</span>
      {sub ? (
        <span className='text-sm text-muted-foreground'>{sub}</span>
      ) : null}
    </div>
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuNote,
  DropdownMenuPerson,
  DropdownMenuHeading,
};
