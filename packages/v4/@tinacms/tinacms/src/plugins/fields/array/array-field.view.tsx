import {
  closestCenter,
  DndContext,
  type UniqueIdentifier,
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
import { AddButton, AddInput } from '@tinacms/ui/components/add-button';
import { DropdownMenuItem } from '@tinacms/ui/components/dropdown-menu';
import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { DrillInCard } from '@tinacms/ui/components/drill-in-card';
import { CardList, ListCard } from '@tinacms/ui/components/list-card';
import { ArrowDown, ArrowUp, Copy } from 'lucide-react';
import { type PointerEvent, type ReactNode, type Ref, useId } from 'react';

export const FULL_HINT = 'List is full';
export const FULL_REASON = 'This list is full. Remove an item to add another.';

export interface ArrayItemView {
  /** Stable across moves, so a dragged card keeps its identity. */
  id: string;
  /** The item for screen readers, such as "Item 1". */
  name: string;
  kind: 'value' | 'group';
  /** Value boxes only. */
  value?: string;
  inputType?: 'text' | 'number';
  onValueChange?: (value: string) => void;
  /** Group cards only. */
  title?: string;
  summary?: string;
  opens?: 'in-place' | 'next-level';
  open?: boolean;
  onToggle?: () => void;
  /** The item's fields show under a head that cannot fold. */
  alwaysOpen?: boolean;
  /** Invalid fields inside a closed card. */
  errorCount?: number;
  /** The message under the card. */
  error?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  children?: ReactNode;
}

export interface ArrayFieldViewProps
  extends Pick<
    FieldWrapperProps,
    'label' | 'labelId' | 'required' | 'errors' | 'help' | 'helpId'
  > {
  items: ArrayItemView[];
  /** The grey words on a card with nothing to show. */
  itemPlaceholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** The list holds as many items as it may: adding is off. */
  full?: boolean;
  /** The add control: a box that takes typed values, or a button. */
  add?: 'input' | 'button';
  addLabel?: string;
  addInputType?: 'text' | 'number';
  onAdd?: (value?: string) => void;
  /**
   * Replaces the add control, such as the block picker. A function receives
   * `disabled`, so the slot turns off with the field.
   */
  addSlot?: ReactNode | ((state: { disabled: boolean }) => ReactNode);
  /** Replaces the words shown for an empty list. */
  emptyText?: string;
  /** A control drawn where a new item will go, such as the block picker. */
  /** `openId` changes on every open, so reopening at the same index remounts `content`. */
  inserting?: { index: number; openId?: number; content: ReactNode };
  onMove?: (from: number, to: number) => void;
  onInsert?: (index: number, where: 'above' | 'below') => void;
  onDuplicate?: (index: number) => void;
  onRemove?: (index: number) => void;
  listRef?: Ref<HTMLDivElement>;
}

function ItemMenu({
  index,
  count,
  full,
  onMove,
  onInsert,
  onDuplicate,
  onRemove,
}: Pick<
  ArrayFieldViewProps,
  'full' | 'onMove' | 'onInsert' | 'onDuplicate' | 'onRemove'
> & { index: number; count: number }) {
  const fullHint = full ? FULL_HINT : undefined;
  return (
    <>
      <DropdownMenuItem
        icon={ArrowUp}
        disabled={index === 0}
        onClick={() => onMove?.(index, index - 1)}
      >
        Move up
      </DropdownMenuItem>
      <DropdownMenuItem
        icon={ArrowDown}
        disabled={index === count - 1}
        onClick={() => onMove?.(index, index + 1)}
      >
        Move down
      </DropdownMenuItem>
      <DropdownMenuItem
        icon='plus'
        disabled={full}
        hint={fullHint}
        onClick={() => onInsert?.(index, 'above')}
      >
        Insert above
      </DropdownMenuItem>
      <DropdownMenuItem
        icon='plus'
        disabled={full}
        hint={fullHint}
        onClick={() => onInsert?.(index, 'below')}
      >
        Insert below
      </DropdownMenuItem>
      <DropdownMenuItem
        icon={Copy}
        disabled={full}
        hint={fullHint}
        onClick={() => onDuplicate?.(index)}
      >
        Duplicate
      </DropdownMenuItem>
      <DropdownMenuItem variant='destructive' onClick={() => onRemove?.(index)}>
        Remove
      </DropdownMenuItem>
    </>
  );
}

type CardProps = Pick<ArrayFieldViewProps, 'itemPlaceholder' | 'disabled'> & {
  item: ArrayItemView;
  actions?: ReactNode;
  readOnly?: boolean;
  onMove: (direction: -1 | 1) => void;
  draggable: boolean;
};

function Card({
  item,
  itemPlaceholder,
  disabled,
  readOnly,
  actions,
  onMove,
  draggable,
}: CardProps) {
  const sortable = useSortable({ id: item.id, disabled: !draggable });
  const { listeners, setNodeRef, transform, transition, isDragging } = sortable;
  const common = {
    name: item.name,
    placeholder: itemPlaceholder,
    error: item.error,
    disabled,
    readOnly,
    actions,
    dragging: isDragging,
    onMove,
    onGripPointerDown: (event: PointerEvent<HTMLButtonElement>) =>
      listeners?.onPointerDown?.(event),
    onBlur: item.onBlur,
    onFocus: item.onFocus,
  };
  return (
    <div
      ref={setNodeRef}
      data-array-item=''
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {item.kind === 'value' ? (
        <ListCard
          {...common}
          value={item.value}
          inputType={item.inputType}
          onValueChange={item.onValueChange}
        />
      ) : (
        <ListCard
          {...common}
          kind='group'
          title={item.title}
          summary={item.summary}
          opens={item.opens}
          open={item.open}
          alwaysOpen={item.alwaysOpen}
          errorCount={item.errorCount}
          onToggle={item.onToggle}
        >
          {item.children}
        </ListCard>
      )}
    </div>
  );
}

function AddControl({
  add,
  addLabel = 'Add item',
  addInputType,
  full,
  disabled,
  onAdd,
  reasonId,
}: Pick<
  ArrayFieldViewProps,
  'add' | 'addLabel' | 'addInputType' | 'full' | 'disabled' | 'onAdd'
> & { reasonId: string }) {
  const off = disabled || full;
  const described = full ? reasonId : undefined;
  return (
    <>
      {add === 'input' ? (
        <AddInput
          label={addLabel}
          type={addInputType}
          disabled={off}
          aria-describedby={described}
          onAdd={(value) => onAdd?.(value)}
        />
      ) : (
        <AddButton
          disabled={off}
          aria-describedby={described}
          onClick={() => onAdd?.()}
        >
          {addLabel}
        </AddButton>
      )}
      {full ? (
        <p id={reasonId} className='px-1 text-sm text-muted-foreground'>
          {FULL_REASON}
        </p>
      ) : null}
    </>
  );
}

interface Drop {
  active: { id: UniqueIdentifier };
  over: { id: UniqueIdentifier } | null;
}

/** The drop handler: it moves the dragged item to the item it lands on. */
export const moveOnDrop =
  (
    ids: readonly UniqueIdentifier[],
    onMove?: (from: number, to: number) => void
  ) =>
  ({ active, over }: Drop) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (from >= 0 && to >= 0) onMove?.(from, to);
  };

/** The editor of an array field. It reads no store; the connected field feeds it. */
export function ArrayFieldView({
  label,
  labelId,
  required,
  errors,
  help,
  helpId,
  items,
  itemPlaceholder = 'Empty item',
  disabled,
  readOnly,
  full,
  add = 'button',
  addLabel,
  addInputType,
  onAdd,
  addSlot,
  emptyText,
  inserting,
  onMove,
  onInsert,
  onDuplicate,
  onRemove,
  listRef,
}: ArrayFieldViewProps) {
  const reasonId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );
  const draggable = !disabled && !readOnly;

  const onDragEnd = moveOnDrop(
    items.map((item) => item.id),
    onMove
  );

  const cards = items.flatMap((item, index) => {
    const card = (
      <Card
        key={item.id}
        item={item}
        itemPlaceholder={itemPlaceholder}
        disabled={disabled}
        readOnly={readOnly}
        draggable={draggable}
        onMove={(direction) => onMove?.(index, index + direction)}
        actions={
          <ItemMenu
            index={index}
            count={items.length}
            full={full}
            onMove={onMove}
            onInsert={onInsert}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
          />
        }
      />
    );
    return inserting?.index === index
      ? [
          <div key={`inserting-${inserting.index}-${inserting.openId ?? 0}`}>
            {inserting.content}
          </div>,
          card,
        ]
      : [card];
  });
  if (inserting && inserting.index >= items.length) {
    cards.push(
      <div key={`inserting-${inserting.index}-${inserting.openId ?? 0}`}>
        {inserting.content}
      </div>
    );
  }

  return (
    <FieldWrapper
      label={label}
      labelId={labelId}
      required={required}
      errors={errors}
      help={help}
      helpId={helpId}
      disabled={disabled}
      data-read-only={readOnly || undefined}
    >
      <CardList
        ref={listRef}
        label={typeof label === 'string' ? label : 'Items'}
        aria-labelledby={labelId}
        readOnly={readOnly}
        disabled={disabled}
      >
        {items.length === 0 ? (
          <p className='px-1 py-1.5 text-sm text-muted-foreground'>
            {emptyText ??
              (readOnly
                ? 'This list is empty.'
                : 'This list is empty. Add the first item below.')}
          </p>
        ) : null}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {cards}
          </SortableContext>
        </DndContext>
        {readOnly
          ? null
          : ((typeof addSlot === 'function'
              ? addSlot({ disabled: disabled ?? false })
              : addSlot) ?? (
              <AddControl
                add={add}
                addLabel={addLabel}
                addInputType={addInputType}
                full={full}
                disabled={disabled}
                onAdd={onAdd}
                reasonId={reasonId}
              />
            ))}
      </CardList>
    </FieldWrapper>
  );
}

export interface ArrayDrillInViewProps
  extends Pick<
    FieldWrapperProps,
    'label' | 'labelId' | 'required' | 'errors' | 'help' | 'helpId'
  > {
  /** The field name. It names the card when `label` is not text. */
  name?: string;
  count: number;
  /** Fields inside that hold a revealed error. */
  invalidCount?: number;
  disabled?: boolean;
  readOnly?: boolean;
  onDrillIn?: () => void;
}

const countWords = (count: number): string => {
  if (count === 0) return 'No items';
  return `${count} ${count === 1 ? 'item' : 'items'}`;
};

/** The card an array shows where it opens as the next form level. */
export function ArrayDrillInView({
  label,
  name,
  required,
  errors,
  help,
  helpId,
  count,
  invalidCount,
  disabled,
  readOnly,
  onDrillIn,
}: ArrayDrillInViewProps) {
  return (
    <FieldWrapper errors={errors} help={help} helpId={helpId}>
      <DrillInCard
        label={typeof label === 'string' ? label : (name ?? '')}
        required={required}
        summary={countWords(count)}
        invalidCount={invalidCount}
        disabled={disabled}
        readOnly={readOnly}
        onOpen={onDrillIn ?? (() => {})}
      />
    </FieldWrapper>
  );
}
