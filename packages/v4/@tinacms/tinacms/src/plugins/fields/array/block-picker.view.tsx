import { AddButton } from '@tinacms/ui/components/add-button';
import { Button } from '@tinacms/ui/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tinacms/ui/components/popover';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { cn } from '@tinacms/ui/lib/utils';
import { type ReactNode, useId, useRef, useState } from 'react';

const BLOCK_PICKER_TITLE = 'Choose a block';
const NO_BLOCKS_MATCH = 'No blocks match.';

export interface BlockOption {
  name: string;
  label: string;
  /** The image over the label in the visual look. */
  preview?: ReactNode;
}

/** `list` shows names in rows; `grid` shows a preview over each name. */
export type BlockLook = 'list' | 'grid';

const matches = (option: BlockOption, query: string): boolean =>
  option.label.toLowerCase().includes(query.trim().toLowerCase());

const OPTION_FOCUS = 'outline-none focus-visible:shadow-focus-ring';

/** Below the button when the panel fits there or there is more room below, else above. */
function sideWithRoom(button: HTMLElement | null): 'bottom' | 'top' {
  if (!button) return 'bottom';
  const { top, bottom } = button.getBoundingClientRect();
  // The keyboard on a phone shrinks the visual viewport, not `innerHeight`.
  const below = (window.visualViewport?.height ?? window.innerHeight) - bottom;
  // A missing token reads as 0, so the panel opens below the button.
  const tallest =
    Number.parseFloat(
      getComputedStyle(button).getPropertyValue('--picker-max-height')
    ) || 0;
  return below >= tallest || below >= top ? 'bottom' : 'top';
}

/**
 * The results' minimum height once the panel is open and positioned, so the
 * panel keeps its size while a search narrows the list. It never exceeds the
 * room the panel has. Empty for the inline picker, which has no panel; the
 * caller keeps that empty string, so the inline list never holds a height.
 */
function holdHeight(results: HTMLElement | null): string {
  const panel = results?.closest<HTMLElement>('[data-slot=popover-content]');
  if (!results || !panel) return '';
  const chrome = panel.offsetHeight - results.offsetHeight;
  return `min(${results.offsetHeight}px, calc(var(--available-height) - ${chrome}px))`;
}

function BlockOptionButton({
  option,
  look,
  onPick,
}: {
  option: BlockOption;
  look: BlockLook;
  onPick: (name: string) => void;
}) {
  return (
    <button
      type='button'
      aria-label={`Add ${option.label}`}
      onClick={() => onPick(option.name)}
      className={cn(
        OPTION_FOCUS,
        look === 'grid'
          ? 'flex min-w-0 cursor-pointer flex-col gap-2 rounded-sm border bg-card p-2 text-left text-base hover:border-input'
          : 'flex min-h-9 w-full cursor-pointer items-center rounded-sm px-2.5 py-1.5 text-left text-base text-foreground hover:bg-muted focus-visible:shadow-focus-inset'
      )}
    >
      {look === 'grid' ? option.preview : null}
      <span className='min-w-0 font-medium wrap-break-word'>
        {option.label}
      </span>
    </button>
  );
}

/**
 * The search box and the flat list of options. It reads no
 * store: the connected picker maps templates to `options`. The search text
 * starts empty each time the view mounts.
 */
function BlockPickerView({
  options,
  look,
  onPick,
}: {
  options: BlockOption[];
  look: BlockLook;
  onPick: (name: string) => void;
}) {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState<string>();
  const search = (value: string) => {
    setHeld((height) => height ?? holdHeight(resultsRef.current));
    setQuery(value);
  };
  const shown = options.filter((option) => matches(option, query));
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-2'>
      <SearchBox
        label='Search blocks'
        size='sm'
        ref={searchRef}
        autoFocus
        value={query}
        onChange={(event) => search(event.target.value)}
        onClear={() => {
          setQuery('');
          searchRef.current?.focus();
        }}
      />
      <div
        ref={resultsRef}
        data-slot='block-picker-results'
        style={{ minHeight: held || undefined }}
        className='-m-1.5 flex min-h-0 flex-1 flex-col gap-2 scroll-py-1.5 overflow-y-auto p-1.5'
      >
        {shown.length === 0 ? (
          <p
            role='status'
            className='px-2.5 py-1.5 text-sm text-muted-foreground'
          >
            {NO_BLOCKS_MATCH}
          </p>
        ) : (
          <div
            role='group'
            aria-label={BLOCK_PICKER_TITLE}
            className={
              look === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col'
            }
          >
            {shown.map((option) => (
              <BlockOptionButton
                key={option.name}
                option={option}
                look={look}
                onPick={onPick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The picker drawn in the list where a block will go. It closes on Escape and
 * on Cancel.
 */
export function InlineBlockPicker({
  options,
  look,
  onPick,
  onCancel,
}: {
  options: BlockOption[];
  look: BlockLook;
  onPick: (name: string) => void;
  onCancel: () => void;
}) {
  return (
    <section
      aria-label={BLOCK_PICKER_TITLE}
      className='flex flex-col gap-2 rounded-md border bg-card p-2'
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        onCancel();
      }}
    >
      <p className='px-2.5 pt-1 text-sm font-medium'>{BLOCK_PICKER_TITLE}</p>
      <BlockPickerView options={options} look={look} onPick={onPick} />
      <Button type='button' variant='outline' size='sm' onClick={onCancel}>
        Cancel
      </Button>
    </section>
  );
}

export interface BlockAddViewProps {
  options: BlockOption[];
  look: BlockLook;
  onPick: (name: string) => void;
  /** Turns the button off and keeps the panel shut. */
  disabled?: boolean;
  /** The list is full: the button is off and `reason` says why. */
  reason?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * The "Add a block" button and its floating panel. The wrapper carries
 * `data-add-picker` and the button `data-slot=add-button`: the list looks them
 * up to put focus back after a block is removed.
 */
export function BlockAddView({
  options,
  look,
  onPick,
  disabled,
  reason,
  open,
  defaultOpen,
  onOpenChange,
}: BlockAddViewProps) {
  const reasonId = useId();
  const picked = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [side, setSide] = useState<'bottom' | 'top'>('bottom');
  const [held, setHeld] = useState(defaultOpen ?? false);
  const off = disabled || reason !== undefined;
  const shown = !off && (open ?? held);
  const setOpen = (next: boolean) => {
    if (next) {
      picked.current = false;
      setSide(sideWithRoom(triggerRef.current));
    }
    setHeld(next);
    onOpenChange?.(next);
  };
  return (
    <div data-add-picker='' className='flex flex-col gap-1'>
      <Popover open={shown} onOpenChange={setOpen}>
        <PopoverTrigger
          ref={triggerRef}
          data-slot='add-button'
          disabled={off}
          aria-describedby={reason ? reasonId : undefined}
          render={<AddButton>Add a block</AddButton>}
        />
        {/* The side is picked once on open. `sticky` keeps the panel inside the visible area, over its button if it must, when the keyboard shrinks the viewport. */}
        <PopoverContent
          aria-label={BLOCK_PICKER_TITLE}
          className='max-h-[min(var(--picker-max-height),var(--available-height))] overflow-hidden'
          side={side}
          collisionAvoidance={{ side: 'none' }}
          sticky
          finalFocus={() => !picked.current}
        >
          <p className='px-2.5 pt-1 text-sm font-medium'>
            {BLOCK_PICKER_TITLE}
          </p>
          <BlockPickerView
            options={options}
            look={look}
            onPick={(name) => {
              setOpen(false);
              picked.current = true;
              onPick(name);
            }}
          />
        </PopoverContent>
      </Popover>
      {reason ? (
        <p id={reasonId} className='px-1 text-sm text-muted-foreground'>
          {reason}
        </p>
      ) : null}
    </div>
  );
}
