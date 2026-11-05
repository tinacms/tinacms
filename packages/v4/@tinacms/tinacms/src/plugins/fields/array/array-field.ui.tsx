import { AddButton } from '@tinacms/ui/components/add-button';
import { Button } from '@tinacms/ui/components/button';
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  get,
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import { type FieldAddress, toFieldAddress } from '../../../core/field/address';
import type { InlineBox } from '../../../core/field/contract';
import {
  customItemLabel,
  itemHeadingOf,
  TEMPLATE_KEY,
  templateFor,
  templateTitle,
} from '../../../core/schema/children';
import type { FieldSchema, TinaDocument } from '../../../core/schema/types';
import {
  itemOpensNextLevel,
  NestedFieldRow,
  ownFieldErrors,
  useActiveField,
  useActivation,
  useDocumentPath,
  useFieldAddress,
  useFieldFrame,
  useFieldRegistry,
  useFieldSchema,
  useFieldValue,
  useInvalidFieldCount,
  useInvalidFieldCounts,
  useListItems,
  useMediaSlice,
  useMoveListItem,
  useOpenLevel,
  useRemoveListItem,
} from '../../../editor';
import { isMediaPath } from '../image/image-field.schema';
import { atLimit, limitOf, stepValue } from '../number/number-field.step';
import { firstText, summaryFieldsOf } from '../object/object-field.schema';
import { StoredValue, UneditableValue } from '../uneditable-value';
import {
  type ArrayTemplateSchema,
  type ObjectArrayFieldSchema,
  type ScalarArrayFieldSchema,
  type TemplatesArrayFieldSchema,
  asArrayFieldSchema,
  isItem,
  isScalarArray,
  isTemplatesArray,
  itemFieldsOf,
  pickerOf,
} from './array-field.schema';
import { seedItem } from './seed-item';
import {
  ArrayDrillInView,
  ArrayFieldView,
  type ArrayItemView,
  FULL_REASON,
} from './array-field.view';

export function ArrayField() {
  const address = useFieldAddress();
  const [value] = useFieldValue<unknown>(address);
  return value == null || Array.isArray(value) ? (
    <ItemList />
  ) : (
    <UneditableValue
      problem='This value is not a list of items, so it cannot be edited here.'
      cleared={[]}
    />
  );
}

function ItemList() {
  const address = useFieldAddress();
  const field = asArrayFieldSchema(useFieldSchema());
  const frame = useFieldFrame();
  const registry = useFieldRegistry();
  const ListView = isScalarArray(field)
    ? registry.get(field.of.type)?.ListView
    : undefined;

  if (ListView) return <ListView />;

  const { htmlFor: _htmlFor, ...shown } = frame;
  return isScalarArray(field) ? (
    <ScalarItems address={address} field={field} frame={shown} />
  ) : (
    <ObjectItems address={address} field={field} frame={shown} />
  );
}

type Frame = Omit<ReturnType<typeof useFieldFrame>, 'htmlFor'>;

interface ItemListProps {
  address: FieldAddress;
  frame: Frame;
}

interface Pending {
  /** Open this item once it exists. */
  open?: number;
  /** Move focus to this item's grip, or to the add control. */
  focus: number | 'add';
}

// A list change lands on the next render. This waits for it, then opens the
// new item and puts focus where the editor was working.
function useAfterChange(
  changed: unknown,
  onOpen?: (index: number) => boolean
): {
  listRef: RefObject<HTMLDivElement | null>;
  afterChange: (pending: Pending) => void;
} {
  const listRef = useRef<HTMLDivElement>(null);
  const pending = useRef<Pending | undefined>(undefined);
  const open = useEffectEvent((index: number) => onOpen?.(index) ?? false);
  useEffect(() => {
    const todo = pending.current;
    if (!todo || changed === undefined) return;
    pending.current = undefined;
    // An item that opened as a form level replaced the list, so no grip is left.
    if (todo.open !== undefined && open(todo.open)) return;
    // Only this list's own cards count: a list nested in an open card has
    // grips and an Add control of its own.
    const list = listRef.current;
    const own = Array.from(list?.children ?? []);
    const cards = own.filter((child) => child.hasAttribute('data-array-item'));
    const add = own
      .flatMap((child) =>
        child.matches('[data-add-picker]')
          ? [...child.querySelectorAll('[data-slot=add-button]')]
          : [child]
      )
      .find((child) =>
        child.matches('[data-slot=add-button], [data-slot=add-input]')
      );
    const target =
      todo.focus === 'add'
        ? add?.matches('input')
          ? add
          : (add?.querySelector('input') ?? add)
        : cards[todo.focus]?.querySelector('[data-grip]');
    if (target instanceof HTMLElement) target.focus();
  }, [changed]);
  return {
    listRef,
    afterChange: (next) => {
      pending.current = next;
    },
  };
}

const focusAfterRemove = (index: number, left: number): Pending['focus'] =>
  left === 0 ? 'add' : Math.min(index, left - 1);

function ObjectItems({
  address,
  field,
  frame,
}: ItemListProps & { field: ObjectArrayFieldSchema }) {
  const registry = useFieldRegistry();
  const documentPath = useDocumentPath();
const listItems = useListItems();
  const removeListItem = useRemoveListItem();
  const moveListItem = useMoveListItem();
  const activation = useActivation();
  const { setActive } = useActiveField();
  const { control, getValues } = useFormContext();
  const {
    fields: items,
    append,
    insert,
    remove,
    move,
  } = useFieldArray({ control, name: address });
  // Re-renders the headings on typing, so an `itemLabel` follows it.
  useWatch({ control, name: address });
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [picking, setPicking] = useState<number | null>(null);
  const { listRef, afterChange } = useAfterChange(items, (index) =>
    showItem(index)
  );
  const max = limitOf(field, 'max');
  const full = max !== undefined && items.length >= max;

  const counts = useInvalidFieldCounts(
    items.map((_, index) => `${address}.${index}`)
  );

  // Opens an item where its depth says: in place, or as the next form level.
  // Returns whether it opened a form level.
  function showItem(index: number): boolean {
    const itemAddress = `${address}.${index}`;
    const stored: unknown = getValues(itemAddress);
    const fields = isItem(stored) ? itemFieldsOf(field, stored) : undefined;
    if (fields && itemOpensNextLevel(itemAddress)) {
      const heading = itemHeadingOf(field, stored, index);
      listItems.openLevel(itemAddress, heading, fields);
      // The level replaced the list, so focus moves to its first field.
      const first = fields.find((subfield) => !subfield.hidden);
      if (first) setActive(toFieldAddress(`${itemAddress}.${first.name}`));
      return true;
    }
    const id = items[index]?.id;
    if (id) setOpen((held) => new Set(held).add(id));
    return false;
  }
  const openOnActivation = useEffectEvent((target: string) => {
    items.forEach((item, index) => {
      if (target.startsWith(`${address}.${index}.`)) {
        setOpen((held) => new Set(held).add(item.id));
      }
    });
  });
  useEffect(() => {
    if (activation) openOnActivation(activation.address);
  }, [activation]);

  const seed = (defaultItem: TinaDocument | undefined, fields: FieldSchema[]) =>
    seedItem(defaultItem, fields, { documentPath, registry });
  const seedFor = (template?: ArrayTemplateSchema): TinaDocument =>
    template
      ? {
          [TEMPLATE_KEY]: template.name,
          ...seed(template.defaultItem, template.fields),
        }
      : seed(
          isTemplatesArray(field) ? undefined : field.defaultItem,
          isTemplatesArray(field) ? [] : field.fields
        );

  // Read at click time: a picker left open can outlive the render that drew it.
  const atMax = () => {
    const list: unknown = getValues(address);
    return max !== undefined && Array.isArray(list) && list.length >= max;
  };
  const insertAt = (index: number, template?: ArrayTemplateSchema) => {
    if (atMax()) {
      setPicking(null);
      return;
    }
    afterChange({ open: index, focus: index });
    insert(index, seedFor(template));
    setPicking(null);
  };
  const add = (template?: ArrayTemplateSchema) => {
    if (atMax()) return;
    afterChange({ open: items.length, focus: items.length });
    append(seedFor(template));
  };
  const moveTo = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    afterChange({ focus: to });
    moveListItem(address, from, to);
  };

  const views: ArrayItemView[] = items.map((item, index) => {
    const itemAddress = `${address}.${index}`;
    const stored: unknown = getValues(itemAddress);
    // `watched` only triggers the render; it can lag a move, so read `stored`.
    const current = isItem(stored) ? stored : undefined;
    const fields = isItem(stored) ? itemFieldsOf(field, stored) : undefined;
    const template =
      isTemplatesArray(field) && current
        ? templateFor(field.templates, current)
        : undefined;
    const heading = itemHeadingOf(field, stored, index);

    let title: string | undefined;
    let summary: string | undefined = heading;
    if (fields && current) {
      const custom = customItemLabel(template ?? field, current);
      const text = firstText(
        summaryFieldsOf(fields).map((subfield) => current[subfield.name])
      );
      title = template ? (custom ?? templateTitle(template)) : undefined;
      summary = template ? (custom ? undefined : text) : (custom ?? text);
    }

    const opens =
      fields && itemOpensNextLevel(itemAddress) ? 'next-level' : 'in-place';
    return {
      id: item.id,
      name: `Item ${index + 1}`,
      kind: 'group',
      title,
      summary,
      opens,
      open: open.has(item.id),
      errorCount: counts[index],
      onToggle: () => {
        if (opens === 'next-level') {
          showItem(index);
          return;
        }
        setOpen((held) => {
          const next = new Set(held);
          if (!next.delete(item.id)) next.add(item.id);
          return next;
        });
      },
      children: fields ? (
        fields.map((subfield) => (
          <NestedFieldRow
            key={subfield.name}
            address={`${itemAddress}.${subfield.name}`}
            node={subfield}
          />
        ))
      ) : (
        <div className='flex flex-col gap-2'>
          <p className='text-sm text-muted-foreground'>
            {isItem(stored)
              ? "This block's template is not in the config. It is saved unchanged. Remove it, or add the template back."
              : 'This item is not an object, so it cannot be edited here. Remove it to save the list.'}
          </p>
          <StoredValue value={stored} />
        </div>
      ),
    };
  });

  const insertTarget = (index: number, where: 'above' | 'below') =>
    where === 'above' ? index : index + 1;

  return (
    <ArrayFieldView
      {...frame}
      listRef={listRef}
      items={views}
      full={full}
      add='button'
      addLabel='Add item'
      onAdd={() => add()}
      addSlot={
        isTemplatesArray(field) ? (
          <TemplatePicker field={field} full={full} onPick={add} />
        ) : undefined
      }
      inserting={
        picking !== null && isTemplatesArray(field)
          ? {
              index: picking,
              content: (
                <TemplatePicker
                  field={field}
                  full={full}
                  onPick={(template) => insertAt(picking, template)}
                  onCancel={() => setPicking(null)}
                />
              ),
            }
          : undefined
      }
      onMove={moveTo}
      onInsert={(index, where) => {
        const at = insertTarget(index, where);
        if (isTemplatesArray(field)) setPicking(at);
        else insertAt(at);
      }}
      onDuplicate={(index) => {
        if (atMax()) return;
        afterChange({ open: index + 1, focus: index + 1 });
        insert(index + 1, structuredClone(getValues(`${address}.${index}`)));
      }}
      onRemove={(index) => {
        afterChange({ focus: focusAfterRemove(index, items.length - 1) });
        removeListItem(address, index);
      }}
    />
  );
}

function TemplatePicker({
  field,
  full = false,
  onPick,
  onCancel,
}: {
  field: TemplatesArrayFieldSchema;
  full?: boolean;
  onPick: (template: ArrayTemplateSchema) => void;
  onCancel?: () => void;
}) {
  const cancel = onCancel ? (
    <Button type='button' variant='outline' size='sm' onClick={onCancel}>
      Cancel
    </Button>
  ) : null;
  const reason = full ? (
    <p className='px-1 text-sm text-muted-foreground'>{FULL_REASON}</p>
  ) : null;
  if (pickerOf(field) === 'list') {
    return (
      <div data-add-picker='' className='flex flex-col gap-1'>
        {field.templates.map((template) => (
          <AddButton
            key={template.name}
            disabled={full}
            onClick={() => onPick(template)}
          >
            {`Add ${templateTitle(template)}`}
          </AddButton>
        ))}
        {reason}
        {cancel}
      </div>
    );
  }
  return (
    <div data-add-picker='' className='flex flex-col gap-2'>
      <div className='grid w-full grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2'>
        {field.templates.map((template) => (
          <button
            key={template.name}
            type='button'
            data-slot='add-button'
            disabled={full}
            aria-label={`Add ${templateTitle(template)}`}
            className='flex flex-col gap-2 rounded-sm border bg-card p-2 text-left text-sm hover:border-input focus-visible:shadow-focus-ring disabled:opacity-60'
            onClick={() => onPick(template)}
          >
            {template.previewImage ? (
              <PreviewImage path={template.previewImage} />
            ) : null}
            <span className='font-medium'>{templateTitle(template)}</span>
          </button>
        ))}
      </div>
      {reason}
      {cancel}
    </div>
  );
}

// A bad path or a broken image shows the template label alone.
function PreviewImage({ path }: { path: string }) {
  const [failed, setFailed] = useState(false);
  if (!isMediaPath(path) || failed) return null;
  return <ResolvedPreview path={path} onError={() => setFailed(true)} />;
}

function ResolvedPreview({
  path,
  onError,
}: {
  path: string;
  onError: () => void;
}) {
  const media = useMediaSlice();
  return (
    <img
      src={media.resolveUrl(path, { width: 256, height: 160 })}
      alt=''
      className='aspect-video w-full rounded-sm object-cover'
      onError={onError}
    />
  );
}

function ScalarItems({
  address,
  field,
  frame,
}: ItemListProps & { field: ScalarArrayFieldSchema }) {
  const registry = useFieldRegistry();
  const documentPath = useDocumentPath();
  const listItems = useListItems();
  const activation = useActivation();
  const { setActive } = useActiveField();
  const { getValues, setValue } = useFormContext();
  const [value, setList] = useFieldValue<unknown[] | undefined>(address);
  const live: unknown = useWatch({ name: address });
  const { errors } = useFormState({ name: address });
  const shown = Array.isArray(live) ? live : (value ?? []);
  const items = value ?? [];
  const box = registry.get(field.of.type)?.metadata?.inlineBox?.(field.of);
  const { listRef, afterChange } = useAfterChange(value ?? []);
  const focusActivated = useEffectEvent((target: string) => {
    const index = items.findIndex(
      (_, position) => target === `${address}.${position}`
    );
    const cards = Array.from(listRef.current?.children ?? []).filter((child) =>
      child.hasAttribute('data-array-item')
    );
    cards[index]?.querySelector('input')?.focus();
  });
  useEffect(() => {
    if (activation && box) focusActivated(activation.address);
  }, [activation, box]);
  const max = limitOf(field, 'max');
  const full = max !== undefined && items.length >= max;

  // An edit inside an item writes `<address>.<index>`, which does not refresh
  // `value`. Read the live list at click time, or a move or remove writes the
  // stale list back over the edit.
  const liveItems = (): unknown[] => getValues(address) ?? [];
  // Each row needs a key that follows its value. An index key keeps a moved or
  // removed row mounted at the old position, and the row shows a stale value.
  const keys = useRef<string[]>([]);
  if (keys.current.length !== items.length) {
    keys.current = items.map(nextScalarKey);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...liveItems()];
    next.splice(to, 0, ...next.splice(from, 1));
    keys.current.splice(to, 0, ...keys.current.splice(from, 1));
    afterChange({ focus: to });
    setList(next);
  };
  const remove = (index: number) => {
    keys.current = keys.current.filter((_, position) => position !== index);
    afterChange({ focus: focusAfterRemove(index, items.length - 1) });
    setList(liveItems().filter((_, position) => position !== index));
  };
  const atMax = () => max !== undefined && liveItems().length >= max;
  const insertValue = (index: number, entry: unknown) => {
    if (atMax()) return;
    keys.current.splice(index, 0, nextScalarKey());
    const next = [...liveItems()];
    next.splice(index, 0, entry);
    afterChange({ focus: index });
    setList(next);
  };
  // `defaultItem`, then `of.defaultValue`, then the item type's own default.
  const seedScalar = (): unknown => {
    const descriptor = registry.get(field.of.type);
    const stored = field.defaultItem ?? field.of.defaultValue;
    if (stored === undefined) return descriptor?.defaultValue ?? null;
    return descriptor?.parse
      ? descriptor.parse(stored, field.of, { documentPath, registry })
      : stored;
  };

  const views: ArrayItemView[] = items.map((_, index) => {
    const itemAddress = `${address}.${index}`;
    const base = {
      id: keys.current[index] ?? itemAddress,
      name: `Item ${index + 1}`,
    };
    const messages = ownFieldErrors(get(errors, itemAddress), itemAddress)[
      itemAddress
    ];
    const revealed = listItems.isRevealed(itemAddress);
    const error = revealed ? messages?.[0] : undefined;
    if (!box) {
      return {
        ...base,
        kind: 'group',
        alwaysOpen: true,
        summary: base.name,
        children: <NestedFieldRow address={itemAddress} node={field.of} />,
      };
    }
    const entry = shown[index];
    const text = entry == null ? '' : String(entry);
    const write = (next: string) =>
      setValue(itemAddress, next, { shouldDirty: true, shouldValidate: true });
    return {
      ...base,
      ...(box.type === 'number' ? numberBox(box, text, write) : undefined),
      kind: 'value',
      inputType: box.type,
      placeholder: box.type === 'text' ? box.placeholder : undefined,
      value: text,
      error,
      onFocus: () => setActive(toFieldAddress(itemAddress)),
      onValueChange: write,
      onBlur: () => listItems.touch(toFieldAddress(itemAddress)),
    };
  });

  const typed = box !== undefined && field.defaultItem === undefined;
  return (
    <ArrayFieldView
      {...frame}
      listRef={listRef}
      items={views}
      full={full}
      add={typed ? 'input' : 'button'}
      addInputType={box?.type ?? 'text'}
      addLabel='Add item'
      onAdd={(text) => {
        if (atMax()) return;
        const entry = text === undefined ? seedScalar() : text;
        keys.current = [...keys.current, nextScalarKey()];
        afterChange({ focus: 'add' });
        setList([...liveItems(), entry]);
      }}
      onMove={move}
      onInsert={(index, where) =>
        insertValue(where === 'above' ? index : index + 1, seedScalar())
      }
      onDuplicate={(index) =>
        insertValue(index + 1, structuredClone(liveItems()[index]))
      }
      onRemove={remove}
    />
  );
}

export function ArrayDrillIn() {
  const address = useFieldAddress();
  const field = asArrayFieldSchema(useFieldSchema());
  const frame = useFieldFrame();
  const [value] = useFieldValue<unknown>(address);
  const invalidCount = useInvalidFieldCount();
  const openLevel = useOpenLevel();
  return (
    <ArrayDrillInView
      {...frame}
      name={field.name}
      count={Array.isArray(value) ? value.length : 0}
      invalidCount={invalidCount}
      onDrillIn={openLevel}
    />
  );
}

const numberBox = (
  { min, max, step }: Extract<InlineBox, { type: 'number' }>,
  text: string,
  write: (next: string) => void
): Pick<ArrayItemView, 'min' | 'max' | 'step' | 'onStep' | 'atLimit'> => ({
  min,
  max,
  step,
  onStep: (direction) => {
    const next = stepValue(text, direction, step, { min, max });
    if (next !== null) write(next);
  },
  atLimit: {
    up: atLimit(text, 'up', { min, max }),
    down: atLimit(text, 'down', { min, max }),
  },
});

let scalarKeyCount = 0;
const nextScalarKey = (): string => `scalar-item-${scalarKeyCount++}`;

let objectKeyCount = 0;
const nextObjectKey = (): string => `object-item-${objectKeyCount++}`;
