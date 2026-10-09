import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@tinacms/ui/lib/utils';
import { useEffect, useId, useRef, useState } from 'react';
import type { ControlProps } from '../field-frame';
import type { FrameFlags } from '../states';
import { ItemMenu, type MenuAction } from './item-menu';
import {
  ADD_SLOT,
  type ListItem,
  type ListLimits,
  type ListNouns,
  leftList,
  limitReasons,
  useList,
} from './use-list';

export interface ItemContext<V> {
  item: ListItem<V>;
  index: number;
  label: string;
  locked: { readOnly: boolean; disabled: boolean };
  force?: 'hover' | 'focus';
  overlay: boolean;
  touched: boolean;
  focusRef: (element: HTMLElement | null) => void;
  update: (value: V) => void;
}

export interface ItemRender {
  header: React.ReactNode;
  trailing?: React.ReactNode;
  below?: React.ReactNode;
  error?: { id: string; message: string };
  invalid?: boolean;
}

export type Adder<V> =
  | {
      kind: 'type';
      parse: (text: string) => V;
      inputType?: 'text' | 'number';
    }
  | { kind: 'button'; onAdded?: (itemId: string) => void }
  | {
      kind: 'request';
      onRequest: (index: number, anchor: HTMLElement | null) => void;
    };

export interface SortableListProps<V> {
  control: ControlProps;
  flags: FrameFlags;
  items: ListItem<V>[];
  onChange: (items: ListItem<V>[]) => void;
  onBlur: () => void;
  limits: ListLimits;
  nouns: ListNouns;
  describe: (value: V) => string;
  makeEmpty: () => V;
  adder: Adder<V>;
  renderItem: (context: ItemContext<V>) => ItemRender;
}

export const capital = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

// The main control of a row (its input, or its open button) carries this
// attribute, so the card draws focus for it and not for the grip or the menu.
export const ROW_MAIN = { 'data-row-main': true } as const;

const cardClasses =
  'group/row relative grid min-w-0 grid-cols-[minmax(0,1fr)] rounded-sm border border-input bg-card shadow-xs transition-colors hover:border-(--input-hover) has-[[data-force=hover]]:border-(--input-hover) has-[[data-row-main]:focus-visible]:border-ring has-[[data-row-main]:focus-visible]:ring-3 has-[[data-row-main]:focus-visible]:ring-focus-glow has-[[data-force=focus]]:border-ring has-[[data-force=focus]]:ring-3 has-[[data-force=focus]]:ring-focus-glow data-invalid:border-destructive has-[[aria-invalid=true]]:border-destructive has-[[data-row-main]:disabled]:border-border has-[[data-row-main]:disabled]:opacity-60 has-[[data-row-main]:disabled]:shadow-none has-[input[readonly]]:border-border-subtle has-[input[readonly]]:bg-muted has-[input[readonly]]:shadow-none has-[input[readonly]]:hover:border-border-subtle data-read-only:border-border-subtle data-read-only:bg-muted data-read-only:shadow-none data-read-only:hover:border-border-subtle';

export const rowInputClasses =
  'h-8 w-full min-w-0 flex-1 border-0 bg-transparent px-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

function GripIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      className='size-4'
      fill='currentColor'
    >
      {[4.5, 8, 11.5].map((y) => (
        <g key={y}>
          <circle cx='6' cy={y} r='1.1' />
          <circle cx='10' cy={y} r='1.1' />
        </g>
      ))}
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      className='size-3.5'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
    >
      <path d='M8 3.5v9M3.5 8h9' />
    </svg>
  );
}

export function ErrorIcon() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      className='mt-0.5 size-3.5 shrink-0'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
    >
      <circle cx='8' cy='8' r='6.25' />
      <path d='M8 4.75v3.75M8 10.75v.5' strokeLinecap='round' />
    </svg>
  );
}

export function UndoNotice({
  message,
  canUndo,
  onUndo,
}: {
  message: string;
  canUndo: boolean;
  onUndo: () => void;
}) {
  return (
    <div className='flex items-center justify-between gap-3 rounded-md bg-foreground px-3 py-1.5 text-label text-background shadow-md'>
      <span className='min-w-0 truncate'>{message}</span>
      {canUndo ? (
        <button
          type='button'
          onClick={onUndo}
          className='shrink-0 cursor-pointer rounded-xs px-1.5 py-0.5 font-medium underline-offset-2 hover:underline focus-visible:focus-ring'
        >
          Undo
        </button>
      ) : (
        <span className='shrink-0 opacity-80'>List is full</span>
      )}
    </div>
  );
}

const slotClasses = (disabled: boolean) =>
  cn(
    'flex min-w-0 items-center gap-0.5 rounded-sm border border-transparent pr-1 pl-0.5 transition-colors',
    disabled
      ? 'opacity-60'
      : 'hover:border-border-subtle hover:bg-card/70 has-[:focus-visible]:border-ring has-[:focus-visible]:bg-card has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-focus-glow'
  );

function PlusTile() {
  return (
    <span className='flex h-8 w-6 shrink-0 items-center justify-center'>
      <span className='flex size-5 items-center justify-center rounded-xs bg-card text-muted-foreground shadow-xs ring-1 ring-border-subtle'>
        <PlusIcon />
      </span>
    </span>
  );
}

// The add slot is the next item, waiting to be typed. Enter adds it and keeps
// focus here, so several items go in one after another.
function TypeSlot({
  id,
  placeholder,
  disabled,
  inputType,
  onAdd,
}: {
  id: string;
  placeholder: string;
  disabled: boolean;
  inputType: 'text' | 'number';
  onAdd: (text: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    if (draft.trim() === '') return;
    onAdd(draft.trim());
    setDraft('');
  };
  return (
    <div className={slotClasses(disabled)}>
      <PlusTile />
      <input
        id={id}
        type={inputType}
        inputMode={inputType === 'number' ? 'numeric' : undefined}
        aria-label={placeholder}
        placeholder={placeholder}
        disabled={disabled}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          }
          if (event.key === 'Escape') setDraft('');
        }}
        onBlur={commit}
        className={rowInputClasses}
      />
      {draft.trim() === '' ? null : (
        <kbd className='shrink-0 rounded-xs border border-border-subtle bg-muted px-1 font-sans text-[11px] text-muted-foreground'>
          Enter
        </kbd>
      )}
    </div>
  );
}

// An item with several fields cannot be typed in one line, so its add slot is a
// button. The new item opens straight away.
function ButtonSlot({
  id,
  label,
  disabled,
  onAdd,
}: {
  id: string;
  label: string;
  disabled: boolean;
  onAdd: () => void;
}) {
  return (
    <button
      id={id}
      type='button'
      disabled={disabled}
      onClick={onAdd}
      className={cn(
        slotClasses(disabled),
        'h-9 w-full cursor-pointer text-left text-sm text-muted-foreground outline-none hover:text-foreground disabled:cursor-not-allowed'
      )}
    >
      <PlusTile />
      <span className='truncate px-1.5'>{label}</span>
    </button>
  );
}

interface RowProps {
  id: string;
  label: string;
  locked: { readOnly: boolean; disabled: boolean };
  hintId: string;
  overlay?: boolean;
  render: ItemRender;
  actions: MenuAction[];
  onKeyMove: (direction: -1 | 1) => void;
  handleRef?: (element: HTMLButtonElement | null) => void;
}

function Row({
  id,
  label,
  locked,
  hintId,
  overlay,
  render,
  actions,
  onKeyMove,
  handleRef,
}: RowProps) {
  const sortable = useSortable({
    id,
    disabled: locked.readOnly || locked.disabled,
  });
  const style = overlay
    ? undefined
    : {
        transform: CSS.Translate.toString(sortable.transform),
        transition: sortable.transition,
      };
  return (
    <li
      ref={overlay ? undefined : sortable.setNodeRef}
      style={style}
      className={cn(
        'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1',
        sortable.isDragging && !overlay ? 'opacity-40' : null
      )}
    >
      <div
        data-invalid={render.invalid ? true : undefined}
        data-read-only={locked.readOnly ? true : undefined}
        className={cn(
          cardClasses,
          overlay ? 'border-input shadow-lg ring-1 ring-foreground/5' : null
        )}
      >
        <div className='flex min-w-0 items-center gap-0.5 pr-1 pl-0.5'>
          {locked.readOnly ? (
            <span className='w-1.5 shrink-0' />
          ) : (
            <button
              type='button'
              aria-label={`Move ${label}`}
              aria-describedby={hintId}
              disabled={locked.disabled}
              ref={(element) => {
                sortable.setActivatorNodeRef(element);
                handleRef?.(element);
              }}
              {...sortable.listeners}
              className='flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-visible:focus-ring active:cursor-grabbing disabled:pointer-events-none'
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                  event.preventDefault();
                  onKeyMove(event.key === 'ArrowUp' ? -1 : 1);
                }
              }}
            >
              <GripIcon />
            </button>
          )}
          {render.header}
          {locked.readOnly ? null : (
            <span
              className={cn(
                'flex rounded-sm bg-card opacity-0 transition-opacity group-hover/row:opacity-100 group-has-[[data-force=hover]]/row:opacity-100 group-has-[:focus-visible]/row:opacity-100 has-data-popup-open:opacity-100 [@media(hover:none)]:opacity-100',
                render.trailing
                  ? null
                  : 'absolute top-0.5 right-0.5 before:pointer-events-none before:absolute before:inset-y-0 before:-left-5 before:w-5 before:bg-linear-to-r before:from-transparent before:to-card'
              )}
            >
              <ItemMenu
                label={`Actions for ${label}`}
                actions={actions}
                disabled={locked.disabled}
              />
            </span>
          )}
          {render.trailing}
        </div>
        {overlay ? null : render.below}
      </div>
      {render.error ? (
        <p
          id={render.error.id}
          role='alert'
          className='flex gap-1.5 pl-1 text-label text-destructive'
        >
          <ErrorIcon />
          {render.error.message}
        </p>
      ) : null}
    </li>
  );
}

// One list behaviour for every list: plain values, groups, blocks and images.
export function SortableList<V>({
  control,
  flags,
  items,
  onChange,
  onBlur,
  limits,
  nouns,
  describe,
  makeEmpty,
  adder,
  renderItem,
}: SortableListProps<V>) {
  const readOnly = Boolean(control.readOnly);
  const disabled = Boolean(control.disabled);
  const list = useList({
    items,
    onChange,
    limits,
    nouns,
    describe,
    makeEmpty,
    locked: readOnly || disabled,
  });
  const reasons = limitReasons(limits, nouns);
  const hintId = useId();
  const mains = useRef(new Map<string, HTMLElement>());
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );
  const {
    id,
    disabled: _disabled,
    readOnly: _readOnly,
    'aria-required': _required,
    'data-force': force,
    ...groupProps
  } = control;
  const addId = `${id}-add`;

  useEffect(() => {
    if (!list.focusId) return;
    if (list.focusId === ADD_SLOT) {
      document.getElementById(addId)?.focus();
    } else {
      mains.current.get(list.focusId)?.focus();
    }
    list.clearFocus();
  });

  const labelOf = (index: number) => `${capital(nouns.one)} ${index + 1}`;
  const indexOf = (itemId: unknown) =>
    items.findIndex((item) => item.id === itemId);
  const added = (itemId: string | null) => {
    if (itemId && adder.kind === 'button') adder.onAdded?.(itemId);
  };
  // A list that asks first (a block template) adds through its own picker.
  const addAt = (index: number, anchor: HTMLElement | null) => {
    if (adder.kind === 'request') adder.onRequest(index, anchor);
    else added(list.add(index));
  };

  const actionsFor = (index: number): MenuAction[] => [
    {
      label: 'Move up',
      onSelect: () => list.move(index, index - 1),
      disabledReason: index === 0 ? 'First' : undefined,
    },
    {
      label: 'Move down',
      onSelect: () => list.move(index, index + 1),
      disabledReason: index === items.length - 1 ? 'Last' : undefined,
    },
    {
      label: 'Add above',
      onSelect: () => addAt(index, mains.current.get(items[index].id) ?? null),
      disabledReason: list.canAdd ? undefined : reasons.atMax,
      separatorBefore: true,
    },
    {
      label: 'Add below',
      onSelect: () =>
        addAt(index + 1, mains.current.get(items[index].id) ?? null),
      disabledReason: list.canAdd ? undefined : reasons.atMax,
    },
    {
      label: 'Duplicate',
      onSelect: () => list.duplicate(index),
      disabledReason: list.canAdd ? undefined : reasons.atMax,
    },
    {
      label: 'Remove',
      onSelect: () => list.remove(index),
      disabledReason: list.canRemove ? undefined : reasons.atMin,
      destructive: true,
      separatorBefore: true,
    },
  ];

  const rowFor = (item: ListItem<V>, index: number, overlay: boolean) => {
    const label = labelOf(index);
    return {
      id: item.id,
      label,
      locked: { readOnly, disabled },
      hintId,
      overlay,
      actions: actionsFor(index),
      onKeyMove: (direction: -1 | 1) => {
        list.move(index, index + direction);
        requestAnimationFrame(() => handles.current.get(item.id)?.focus());
      },
      render: renderItem({
        item,
        index,
        label,
        locked: { readOnly, disabled },
        force: index === 0 ? force : undefined,
        overlay,
        touched: Boolean(flags.touched),
        focusRef: (element) => {
          if (overlay) return;
          if (element) mains.current.set(item.id, element);
          else mains.current.delete(item.id);
        },
        update: (next: V) => list.update(index, next),
      }),
    };
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${labelOf(indexOf(active.id))}.`,
    onDragOver: ({ over }) =>
      over
        ? `Over position ${indexOf(over.id) + 1} of ${items.length}.`
        : undefined,
    onDragEnd: () => undefined,
    onDragCancel: () => 'Move cancelled.',
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (over && active.id !== over.id) {
      list.move(indexOf(active.id), indexOf(over.id));
    }
  };

  const activeIndex = activeId ? indexOf(activeId) : -1;
  const article = /^[aeiou]/i.test(nouns.one) ? 'an' : 'a';
  const slotLabel =
    list.canAdd || disabled ? `Add ${article} ${nouns.one}` : reasons.atMax;

  return (
    <div
      {...groupProps}
      role='group'
      className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2'
      onBlur={(event) => {
        if (leftList(event)) onBlur();
      }}
    >
      <span id={hintId} className='sr-only'>
        Drag to reorder, or press the up and down arrow keys.
      </span>
      <div
        className={cn(
          'grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1.5 rounded-md border border-border-subtle p-1.5',
          readOnly ? 'border-transparent p-0' : null,
          disabled ? 'bg-transparent' : null,
          readOnly || disabled ? null : 'bg-muted/60'
        )}
      >
        {items.length === 0 ? null : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[verticalOnly]}
            accessibility={{ announcements }}
            onDragStart={({ active }) => setActiveId(String(active.id))}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className='grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1.5'>
                {items.map((item, index) => (
                  <Row
                    key={item.id}
                    {...rowFor(item, index, false)}
                    handleRef={(element) => {
                      if (element) handles.current.set(item.id, element);
                      else handles.current.delete(item.id);
                    }}
                  />
                ))}
              </ul>
            </SortableContext>
            <DragOverlay>
              {activeIndex >= 0 ? (
                <ul className='grid'>
                  <Row {...rowFor(items[activeIndex], activeIndex, true)} />
                </ul>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
        {readOnly ? (
          items.length === 0 ? (
            <p className='px-2 py-1.5 text-label text-muted-foreground'>
              No {nouns.many}.
            </p>
          ) : null
        ) : adder.kind === 'type' ? (
          <TypeSlot
            id={addId}
            inputType={adder.inputType ?? 'text'}
            disabled={!list.canAdd}
            placeholder={slotLabel}
            onAdd={(text) => list.append(adder.parse(text))}
          />
        ) : (
          <ButtonSlot
            id={addId}
            label={slotLabel}
            disabled={!list.canAdd}
            onAdd={() => addAt(items.length, document.getElementById(addId))}
          />
        )}
      </div>
      {list.removed ? (
        <UndoNotice
          message={`Removed “${describe(list.removed.item.value) || `empty ${nouns.one}`}”.`}
          canUndo={list.canUndo}
          onUndo={list.undo}
        />
      ) : null}
      <span className='sr-only' aria-live='polite'>
        {list.announcement}
      </span>
    </div>
  );
}
