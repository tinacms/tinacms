import { AddButton } from '@tinacms/ui/components/add-button';
import { Button } from '@tinacms/ui/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@tinacms/ui/components/popover';
import { SearchBox } from '@tinacms/ui/components/search-box';
import { cn } from '@tinacms/ui/lib/utils';
import {
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const BLOCK_PICKER_TITLE = 'Choose a block';
const NO_BLOCKS_MATCH = 'No blocks match.';

export interface BlockOption {
  name: string;
  label: string;
  /** Options with the same category share a heading. */
  category?: string;
  /** The image over the label in the visual look. */
  preview?: ReactNode;
}

/** `list` shows names in rows; `grid` shows a preview over each name. */
export type BlockLook = 'list' | 'grid';

interface BlockGroup {
  heading?: string;
  options: BlockOption[];
}

/** Ungrouped options first, then each category in the order it first appears. */
function groupBlocks(options: BlockOption[]): BlockGroup[] {
  const groups: BlockGroup[] = [{ options: [] }];
  for (const option of options) {
    if (option.category === undefined) {
      groups[0].options.push(option);
      continue;
    }
    const existing = groups.find((group) => group.heading === option.category);
    if (existing) existing.options.push(option);
    else groups.push({ heading: option.category, options: [option] });
  }
  return groups.filter((group) => group.options.length > 0);
}

const matches = (option: BlockOption, query: string): boolean =>
  option.label.toLowerCase().includes(query.trim().toLowerCase());

const OPTION_FOCUS = 'outline-none focus-visible:shadow-focus-ring';

/** The tallest the floating panel gets; past it, the options scroll. */
const PANEL_MAX_HEIGHT = 320;

/** Below the button when the panel fits there or there is more room below, else above. */
function sideWithRoom(button: HTMLElement | null): 'bottom' | 'top' {
  if (!button) return 'bottom';
  const { top, bottom } = button.getBoundingClientRect();
  const below = window.innerHeight - bottom;
  return below >= PANEL_MAX_HEIGHT || below >= top ? 'bottom' : 'top';
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
 * The search box and the options under their group headings. It reads no
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
  const headingId = useId();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [resultsHeight, setResultsHeight] = useState<number>();
  useLayoutEffect(() => {
    setResultsHeight(resultsRef.current?.offsetHeight);
  }, []);
  const groups = groupBlocks(
    options.filter((option) => matches(option, query))
  );
  return (
    <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-2'>
      <SearchBox
        label='Search blocks'
        size='sm'
        ref={searchRef}
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => {
          setQuery('');
          searchRef.current?.focus();
        }}
      />
      <div
        ref={resultsRef}
        style={{ minHeight: resultsHeight }}
        className='flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto'
      >
        {groups.length === 0 ? (
          <p
            role='status'
            className='px-2.5 py-1.5 text-sm text-muted-foreground'
          >
            {NO_BLOCKS_MATCH}
          </p>
        ) : (
          groups.map((group, index) => {
            const id = `${headingId}-${index}`;
            return (
              <div
                key={group.heading ?? ''}
                role='group'
                aria-labelledby={group.heading ? id : undefined}
                aria-label={group.heading ? undefined : BLOCK_PICKER_TITLE}
                className='flex flex-col gap-1'
              >
                {group.heading ? (
                  <p
                    id={id}
                    className='px-2.5 py-1 text-xs font-medium text-muted-foreground'
                  >
                    {group.heading}
                  </p>
                ) : null}
                <div
                  className={
                    look === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col'
                  }
                >
                  {group.options.map((option) => (
                    <BlockOptionButton
                      key={option.name}
                      option={option}
                      look={look}
                      onPick={onPick}
                    />
                  ))}
                </div>
              </div>
            );
          })
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
        {/* The side is picked once on open, so the panel stays put while the search narrows it. */}
        <PopoverContent
          aria-label={BLOCK_PICKER_TITLE}
          className='overflow-hidden'
          side={side}
          collisionAvoidance={{ side: 'none' }}
          style={{
            maxHeight: `min(${PANEL_MAX_HEIGHT}px, var(--available-height))`,
          }}
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
