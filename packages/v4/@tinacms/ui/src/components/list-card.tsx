import { cva } from 'class-variance-authority';
import { GripVertical } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  use,
  useRef,
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
        rest: 'border-input',
        invalid: 'border-destructive',
        readOnly: 'border-border-subtle bg-muted shadow-none',
        disabled: 'border-border shadow-none',
        dragging: 'z-10 border-input shadow-lifted',
      },
      kind: { value: '', group: '' },
    },
    // The inline box of a value card has no ring of its own, so the card draws it. The grip, head and
    // menu buttons carry their own ring, and the card stays still for them.
    compoundVariants: [
      {
        kind: 'value',
        state: 'rest',
        className:
          'has-[input:focus-visible]:border-ring has-[input:focus-visible]:shadow-focus-field',
      },
      {
        kind: 'value',
        state: 'invalid',
        className: 'has-[input:focus-visible]:shadow-focus-field',
      },
    ],
    defaultVariants: { state: 'rest', kind: 'value' },
  }
);

/** How many open heads stick while their fields scroll. */
const MAX_PINNED = 2;

/** Where a pinned head sticks, by how many pinned heads sit above it. */
const PIN_TOP = ['top-0', 'top-(--item-header-height)'] as const;

/** `null` means the surrounding form level does not pin heads. */
const PinDepthContext = createContext<number | null>(null);

/** Turns on pinning for the cards inside: the head of an open card sticks, two deep at most. */
function PinHeads({ children }: { children: ReactNode }) {
  return <PinDepthContext value={0}>{children}</PinDepthContext>;
}

const HEAD_HOVER =
  'hover:bg-muted *:data-grip:group-hover/head:text-foreground **:data-more:group-hover/head:text-foreground';

const GRIP =
  'flex h-8 w-6 flex-none cursor-grab touch-none items-center justify-center rounded-sm border-0 bg-transparent p-0 text-muted-foreground outline-none focus-visible:shadow-focus-ring disabled:cursor-not-allowed';

type ListCardCommonProps = Omit<
  ComponentProps<'div'>,
  'children' | 'title' | 'onToggle'
> & {
  /** The item's name for screen readers, such as "Tag 1". The grip and menu are named after it. */
  name: string;
  /** The grey words while it is empty, such as "Empty tag". */
  placeholder?: string;
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
};

/** Each kind takes only the props it uses. */
type ValueKindProps = {
  /** One value in an inline box, such as a tag. */
  kind?: 'value';
  value?: string;
  onValueChange?: (value: string) => void;
  /** `number` for a list of numbers. */
  inputType?: 'text' | 'number';
  /** Number boxes only: the limits and step of the item's own field. */
  min?: number;
  max?: number;
  step?: number;
  /** Number boxes only: steps the value. The step buttons and the up and down arrows call it. */
  onStep?: (direction: 'up' | 'down') => void;
  /** Number boxes only: the step buttons that are at a limit. */
  atLimit?: { up: boolean; down: boolean };
};

type GroupKindProps = {
  /** A head that opens the item's fields. */
  kind: 'group';
  /** A bold template name before the summary, for blocks. */
  title?: string;
  /** The item's summary, such as its first field. */
  summary?: string;
  /** A small picture before the words. */
  thumbnail?: ReactNode;
  /** `in-place` (default) opens the fields under the head. `next-level` goes to them. */
  opens?: 'in-place' | 'next-level';
  /** With `in-place`: whether the fields show. */
  open?: boolean;
  onToggle?: () => void;
  /** The fields always show under a head that does not fold. */
  alwaysOpen?: boolean;
  /** A short amber note at the end of the head, such as "No alt text". */
  hint?: string;
  /** The count of invalid fields inside. It shows while the card is closed; open cards carry none. */
  errorCount?: number;
  /** The item's fields, shown when open in place. */
  children?: ReactNode;
};

type ListCardProps = ListCardCommonProps & (ValueKindProps | GroupKindProps);

// Every kind's props at once, so ListCard can take them apart in one destructure.
type EveryKindProps = { kind?: 'value' | 'group' } & Partial<
  Omit<ValueKindProps, 'kind'>
> &
  Partial<Omit<GroupKindProps, 'kind'>>;

type ValueBodyProps = Pick<
  ListCardCommonProps,
  'name' | 'placeholder' | 'readOnly' | 'disabled'
> &
  Omit<ValueKindProps, 'kind' | 'inputType'> & {
    error: boolean;
    inputType: 'text' | 'number';
  };

const STEPS = [
  { direction: 'up', name: 'Increase', glyph: 'chevron-up' },
  { direction: 'down', name: 'Decrease', glyph: 'chevron-down' },
] as const;

const STEP_BUTTON =
  'flex h-1/2 w-6 cursor-pointer items-center justify-center rounded-xs border-0 bg-transparent p-0 text-muted-foreground outline-none hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-45';

function ValueBody({
  name,
  placeholder,
  readOnly,
  disabled,
  error,
  value,
  onValueChange,
  inputType,
  min,
  max,
  step,
  onStep,
  atLimit,
}: ValueBodyProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stepper =
    inputType === 'number' && onStep && !readOnly && !disabled
      ? onStep
      : undefined;
  return (
    <>
      {readOnly ? null : (
        <span
          aria-hidden='true'
          className='mr-1 ml-0.5 h-4 w-px flex-none bg-border-subtle'
        />
      )}
      <input
        ref={inputRef}
        type={inputType}
        min={min}
        max={max}
        step={inputType === 'number' ? (step ?? 'any') : undefined}
        aria-label={name}
        aria-invalid={error || undefined}
        value={value ?? ''}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        onChange={(event) => onValueChange?.(event.target.value)}
        onWheel={
          inputType === 'number'
            ? (event) => event.currentTarget.blur()
            : undefined
        }
        onKeyDown={(event) => {
          if (!stepper) return;
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            stepper(event.key === 'ArrowUp' ? 'up' : 'down');
          }
        }}
        className='h-8 min-w-0 flex-1 appearance-none border-0 bg-transparent px-1.5 font-sans text-base text-ellipsis text-foreground tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
      />
      {stepper ? (
        <span className='flex h-8 flex-none flex-col justify-center'>
          {STEPS.map(({ direction, name: stepName, glyph }) => (
            <button
              key={direction}
              type='button'
              tabIndex={-1}
              aria-label={`${stepName} ${name}`}
              disabled={atLimit?.[direction]}
              className={STEP_BUTTON}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                inputRef.current?.focus();
                stepper(direction);
              }}
            >
              <Icon glyph={glyph} size={14} />
            </button>
          ))}
        </span>
      ) : null}
    </>
  );
}

type GroupHeadProps = Pick<
  ListCardCommonProps,
  'name' | 'placeholder' | 'disabled'
> &
  Omit<GroupKindProps, 'kind' | 'children'>;

type HeadTextProps = Pick<
  GroupHeadProps,
  'name' | 'placeholder' | 'title' | 'summary'
>;

/** The words of a group head: the screen reader name, then the title and summary. */
function HeadText({ name, title, summary, placeholder }: HeadTextProps) {
  return (
    <>
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
    </>
  );
}

function GroupHead({
  name,
  placeholder,
  disabled,
  title,
  summary,
  thumbnail,
  opens = 'in-place',
  open = false,
  onToggle,
  hint,
  errorCount = 0,
  alwaysOpen = false,
}: GroupHeadProps) {
  const inPlace = opens === 'in-place';
  if (alwaysOpen) {
    return (
      <div className='flex h-8 min-w-0 flex-1 items-center px-2 font-sans text-base text-foreground'>
        <span className='min-w-0 flex-1 truncate'>
          <HeadText
            name={name}
            title={title}
            summary={summary}
            placeholder={placeholder}
          />
        </span>
      </div>
    );
  }
  return (
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
        <HeadText
          name={name}
          title={title}
          summary={summary}
          placeholder={placeholder}
        />
      </span>
      {hint ? (
        <span className='flex-none text-xs whitespace-nowrap text-unsaved'>
          {hint}
        </span>
      ) : null}
      {errorCount > 0 && !(inPlace && open) ? (
        <Badge
          kind='count'
          tone='error'
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
  );
}

/**
 * One item of an array field: a grip that drags, or moves with the up and down arrow keys; the
 * item itself; and the item menu. A card carries no unsaved marker, because unsaved shows on the
 * document and not on its fields. `className` styles the card; other props go on the wrapper that
 * also holds the message under the card.
 */
function ListCard(props: ListCardProps) {
  const {
    name,
    placeholder,
    error,
    invalid = false,
    readOnly = false,
    disabled = false,
    dragging = false,
    onMove,
    onGripPointerDown,
    actions,
    className,
    kind = 'value',
    value,
    onValueChange,
    inputType = 'text',
    min,
    max,
    step,
    onStep,
    atLimit,
    title,
    summary,
    thumbnail,
    opens = 'in-place',
    open = false,
    onToggle,
    hint,
    errorCount = 0,
    alwaysOpen = false,
    children,
    ...rest
  }: ListCardCommonProps & EveryKindProps = props;
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
  const showFields =
    kind === 'group' &&
    opens === 'in-place' &&
    (open || alwaysOpen) &&
    Boolean(children);
  const pinDepth = use(PinDepthContext);
  const pinned = showFields && pinDepth !== null && pinDepth < MAX_PINNED;

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
      {...rest}
    >
      <div
        data-slot='list-card'
        className={cn(listCardVariants({ state, kind }), className)}
      >
        <div
          data-slot='list-card-head'
          data-pinned={pinned || undefined}
          className={cn(
            'group/head flex min-h-(--item-header-height) min-w-0 items-center gap-0.5 pr-1 pl-0.5 transition-colors',
            showFields ? 'rounded-t-sm' : 'rounded-sm',
            pinned && ['sticky z-10 bg-card', PIN_TOP[pinDepth ?? 0]],
            !readOnly && !disabled && !dragging && HEAD_HOVER
          )}
        >
          {readOnly ? (
            <span aria-hidden='true' className='w-1.5 flex-none' />
          ) : (
            <button
              type='button'
              aria-label={`Move ${name}`}
              title={
                disabled
                  ? undefined
                  : 'Drag to move, or press the up and down arrow keys'
              }
              disabled={disabled}
              onKeyDown={onGripKey}
              onPointerDown={onGripPointerDown}
              data-grip=''
              className={cn(GRIP, dragging && 'cursor-grabbing')}
            >
              <Icon glyph={GripVertical} size={16} />
            </button>
          )}
          {kind === 'group' ? (
            <GroupHead
              name={name}
              placeholder={placeholder}
              disabled={disabled}
              title={title}
              summary={summary}
              thumbnail={thumbnail}
              opens={opens}
              open={open}
              onToggle={onToggle}
              hint={hint}
              errorCount={errorCount}
              alwaysOpen={alwaysOpen}
            />
          ) : (
            <ValueBody
              name={name}
              placeholder={placeholder}
              readOnly={readOnly}
              disabled={disabled}
              error={bad}
              value={value}
              onValueChange={onValueChange}
              inputType={inputType}
              min={min}
              max={max}
              step={step}
              onStep={onStep}
              atLimit={atLimit}
            />
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
                    className='flex-none opacity-0 not-disabled:hover:bg-transparent disabled:opacity-0 group-focus-within/list-card:opacity-100 group-hover/list-card:opacity-100 data-popup-open:opacity-100 pointer-coarse:not-disabled:opacity-100'
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
            {pinDepth === null ? (
              children
            ) : (
              <PinDepthContext value={pinDepth + 1}>{children}</PinDepthContext>
            )}
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
export { CardList, ListCard, listCardVariants, PinHeads };
