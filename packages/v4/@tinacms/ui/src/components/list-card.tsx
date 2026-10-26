import { cva } from 'class-variance-authority';
import { GripVertical } from 'lucide-react';
import type {
  ComponentProps,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from 'react';

import { Badge } from '@tinacms/ui/components/badge';
import { Button } from '@tinacms/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@tinacms/ui/components/dropdown-menu';
import { Icon } from '@tinacms/ui/components/icon';
import { cn } from '@tinacms/ui/lib/utils';

const listCardVariants = cva(
  'group/list-card relative box-border flex min-w-0 flex-col rounded-sm border bg-card shadow-xs transition-[border-color,box-shadow]',
  {
    variants: {
      state: {
        rest: 'border-input has-focus-visible:border-ring has-focus-visible:shadow-focus-field',
        invalid: 'border-destructive',
        readOnly: 'border-border-subtle bg-muted shadow-none',
        disabled: 'border-border shadow-none',
        dragging: 'z-10 border-input shadow-lifted',
      },
    },
    defaultVariants: { state: 'rest' },
  }
);

// One hover for the whole head: a light tint, and the grip and the menu's dots darken.
const HEAD_HOVER =
  'hover:bg-muted *:data-grip:group-hover/head:text-foreground **:data-more:group-hover/head:text-foreground';

const GRIP =
  'flex h-8 w-6 flex-none cursor-grab touch-none items-center justify-center rounded-sm border-0 bg-transparent p-0 text-muted-foreground outline-none focus-visible:shadow-focus-ring disabled:cursor-not-allowed';

type ListCardProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** `value` holds one value in an inline box, such as a tag. `group` is a head that opens the item's fields. */
  kind?: 'value' | 'group';
  /** The item's name for screen readers, such as "Tag 1". The grip and menu are named after it. */
  name: string;
  /** With kind `value`: the value. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** The grey words while it is empty, such as "Empty tag". */
  placeholder?: string;
  /** With kind `value`: `number` for a list of numbers. */
  inputType?: 'text' | 'number';
  /** With kind `group`: a bold template name before the summary, for blocks. */
  title?: string;
  /** With kind `group`: the item's summary, such as its first field. */
  summary?: string;
  /** With kind `group`: a small picture before the words. */
  thumbnail?: ReactNode;
  /** With kind `group`: `in-place` (default) opens the fields under the head. `next-level` goes to them. */
  opens?: 'in-place' | 'next-level';
  /** With kind `group` that opens in place: whether its fields show. */
  open?: boolean;
  onToggle?: () => void;
  /** With kind `group`: a short amber note at the end of the head, such as "No alt text". */
  hint?: string;
  /** The count of invalid fields inside. It shows while the card is closed; open cards carry none. */
  errorCount?: number;
  /** The message under the card. Draws the red border. */
  error?: string;
  /** The red border without a message. */
  invalid?: boolean;
  /** A muted card with no grip and no menu. */
  readOnly?: boolean;
  /** The card's controls are off, with no hover. */
  disabled?: boolean;
  dragging?: boolean;
  /** Called when the grip has focus and the up or down arrow is pressed. */
  onMove?: (direction: -1 | 1) => void;
  /** Starts a drag from the grip. */
  onGripPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
  /** `DropdownMenuItem`s for the item menu. Remove is a `destructive` item. Without them there is no menu. */
  actions?: ReactNode;
  /** With kind `group` open in place: the item's fields. */
  children?: ReactNode;
};

/**
 * One item of an array field: a grip that drags, or moves with the up and down arrow keys; the
 * item itself; and the item menu. A card carries no unsaved marker, because unsaved shows on the
 * document and not on its fields. `className` styles the card; other props go on the wrapper that
 * also holds the message under the card.
 */
function ListCard({
  kind = 'value',
  name,
  value,
  onValueChange,
  placeholder,
  inputType = 'text',
  title,
  summary,
  thumbnail,
  opens = 'in-place',
  open = false,
  onToggle,
  hint,
  errorCount = 0,
  error,
  invalid = false,
  readOnly = false,
  disabled = false,
  dragging = false,
  onMove,
  onGripPointerDown,
  actions,
  className,
  children,
  ...props
}: ListCardProps) {
  const bad = invalid || Boolean(error) || errorCount > 0;
  const state = readOnly
    ? 'readOnly'
    : disabled
      ? 'disabled'
      : dragging
        ? 'dragging'
        : bad
          ? 'invalid'
          : 'rest';
  const inPlace = opens === 'in-place';
  const showFields = kind === 'group' && inPlace && open && Boolean(children);

  const onGripKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      onMove?.(event.key === 'ArrowUp' ? -1 : 1);
    }
  };

  return (
    <div
      data-slot='list-card-item'
      className='relative flex min-w-0 flex-col gap-1'
      {...props}
    >
      <div
        data-slot='list-card'
        className={cn(listCardVariants({ state }), className)}
      >
        <div
          data-slot='list-card-head'
          className={cn(
            'group/head flex min-h-10 min-w-0 items-center gap-0.5 pr-1 pl-0.5 transition-colors',
            showFields ? 'rounded-t-sm' : 'rounded-sm',
            !readOnly && !disabled && !dragging && HEAD_HOVER
          )}
        >
          {readOnly ? (
            <span aria-hidden='true' className='w-1.5 flex-none' />
          ) : (
            <button
              type='button'
              aria-label={`Move ${name}`}
              title='Drag to move, or press the up and down arrow keys'
              disabled={disabled}
              onKeyDown={onGripKey}
              onPointerDown={onGripPointerDown}
              data-grip=''
              className={cn(GRIP, dragging && 'cursor-grabbing')}
            >
              <Icon glyph={GripVertical} size={16} />
            </button>
          )}
          {kind === 'value' ? (
            <>
              {readOnly ? null : (
                <span
                  aria-hidden='true'
                  className='mr-1 ml-0.5 h-4 w-px flex-none bg-border-subtle'
                />
              )}
              <input
                type={inputType}
                aria-label={name}
                aria-invalid={error ? true : undefined}
                value={value}
                placeholder={placeholder}
                readOnly={readOnly}
                disabled={disabled}
                onChange={(event) => onValueChange?.(event.target.value)}
                className='h-8 min-w-0 flex-1 appearance-none border-0 bg-transparent px-1.5 font-sans text-base text-ellipsis text-foreground tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
              />
            </>
          ) : (
            <button
              type='button'
              aria-expanded={inPlace ? open : undefined}
              disabled={disabled}
              onClick={onToggle}
              className='flex h-8 min-w-0 flex-1 cursor-pointer items-center gap-0.5 rounded-sm border-0 bg-transparent px-0.5 text-left font-sans text-base text-foreground outline-none focus-visible:shadow-focus-ring disabled:cursor-not-allowed'
            >
              {inPlace ? (
                <span
                  aria-hidden='true'
                  className={cn(
                    'flex flex-none text-muted-foreground transition-transform',
                    open && 'rotate-90'
                  )}
                >
                  <Icon glyph='chevron-right' size={16} />
                </span>
              ) : null}
              {thumbnail ? (
                <span
                  aria-hidden='true'
                  className='ml-1 flex size-7 flex-none overflow-hidden rounded-xs'
                >
                  {thumbnail}
                </span>
              ) : null}
              <span className='min-w-0 flex-1 truncate px-1.5'>
                <span className='sr-only'>{name}: </span>
                {title ? <span className='font-medium'>{title}</span> : null}
                {title && summary ? (
                  <span className='text-muted-foreground'> · {summary}</span>
                ) : null}
                {title ? null : (
                  <span className={cn(!summary && 'text-muted-foreground')}>
                    {summary || placeholder}
                  </span>
                )}
              </span>
              {hint ? (
                <span className='flex-none text-xs whitespace-nowrap text-unsaved'>
                  {hint}
                </span>
              ) : null}
              {errorCount > 0 && !(inPlace && open) ? (
                <Badge
                  kind='errors'
                  count={errorCount}
                  srLabel={`, ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`}
                />
              ) : null}
              {inPlace ? null : (
                <span
                  aria-hidden='true'
                  className='flex w-7 flex-none justify-center text-muted-foreground'
                >
                  <Icon glyph='chevron-right' size={16} />
                </span>
              )}
            </button>
          )}
          {!readOnly && actions ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant='icon'
                    size='sm'
                    icon='more'
                    data-more=''
                    className='flex-none opacity-0 not-disabled:hover:bg-transparent disabled:opacity-0 group-focus-within/list-card:opacity-100 group-hover/list-card:opacity-100 data-popup-open:opacity-100'
                  />
                }
                disabled={disabled}
                aria-label={`Actions for ${name}`}
              />
              <DropdownMenuContent
                align='end'
                aria-label={`Actions for ${name}`}
              >
                {actions}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
        {showFields ? (
          <div className='flex flex-col gap-4 border-t border-border-subtle pt-1.5 pr-3 pb-3.5 pl-8.5'>
            {children}
          </div>
        ) : null}
      </div>
      {error ? (
        <span role='alert' className='pl-1 text-sm text-destructive'>
          {error}
        </span>
      ) : null}
    </div>
  );
}

type CardListProps = ComponentProps<'div'> & {
  /** The field's name, which screen readers hear for the list. */
  label: string;
  /** The cards sit flat, with no ground or border round them. */
  readOnly?: boolean;
  /** No ground behind the cards. */
  disabled?: boolean;
};

/** The light container that holds the list cards of an array field and its add button. */
function CardList({
  label,
  readOnly = false,
  disabled = false,
  className,
  ...props
}: CardListProps) {
  return (
    <div
      role='group'
      aria-label={label}
      data-slot='card-list'
      className={cn(
        'box-border flex flex-col gap-1.5 rounded-md border border-border-subtle bg-list-ground p-1.5',
        readOnly && 'border-transparent bg-transparent p-0',
        disabled && 'bg-transparent',
        className
      )}
      {...props}
    />
  );
}

export type { CardListProps, ListCardProps };
export { CardList, ListCard, listCardVariants };
