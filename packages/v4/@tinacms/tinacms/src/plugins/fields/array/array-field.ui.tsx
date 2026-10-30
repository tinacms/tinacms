import { AddButton } from '@tinacms/ui/components/add-button';
import { Button } from '@tinacms/ui/components/button';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { type ReactNode, useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { FieldAddress } from '../../../core/field/address';
import { seedItem } from './seed-item';
import { TEMPLATE_KEY, templateFor } from '../../../core/schema/children';
import type { FieldSchema, TinaDocument } from '../../../core/schema/types';
import {
  NestedFieldRow,
  useDocumentPath,
  useFieldAddress,
  useFieldFrame,
  useFieldRegistry,
  useFieldSchema,
  useFieldValue,
  useMediaSlice,
} from '../../../editor';
import {
  type ArrayTemplateSchema,
  type ItemLabel,
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
import { isMediaPath } from '../image/image-field.schema';
import { StoredValue, UneditableValue } from '../uneditable-value';

export function ArrayField() {
  const address = useFieldAddress();
  const field = asArrayFieldSchema(useFieldSchema());
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

  return (
    <FieldWrapper {...frame}>
      {isScalarArray(field) ? (
        <ScalarItems address={address} field={field} />
      ) : (
        <ObjectItems address={address} field={field} />
      )}
    </FieldWrapper>
  );
}

interface ItemListProps {
  address: FieldAddress;
}

function ObjectItems({
  address,
  field,
}: ItemListProps & {
  field: ObjectArrayFieldSchema;
}) {
  const registry = useFieldRegistry();
  const documentPath = useDocumentPath();
  const { control, getValues } = useFormContext();
  const {
    fields: items,
    append,
    remove,
    move,
  } = useFieldArray({ control, name: address });
  // Subscribes the headings to edits, so an `itemLabel` follows typing.
  const watched: unknown = useWatch({ control, name: address });

  const seed = (defaultItem: TinaDocument | undefined, fields: FieldSchema[]) =>
    seedItem(defaultItem, fields, { documentPath, registry });
  const addFieldsItem = (
    fields: FieldSchema[],
    defaultItem: TinaDocument | undefined
  ) => append(seed(defaultItem, fields));
  const addTemplateItem = (template: ArrayTemplateSchema) =>
    append({
      [TEMPLATE_KEY]: template.name,
      ...seed(template.defaultItem, template.fields),
    });

  return (
    <>
      <div
        role='group'
        aria-labelledby={`${address}-label`}
        className='flex flex-col gap-3'
      >
        {items.map((item, index) => {
          const stored: unknown = getValues(`${address}.${index}`);
          // The watched copy only re-renders the heading; it can lag a move.
          const shown: unknown = Array.isArray(watched)
            ? watched[index]
            : stored;
          const fields = isItem(stored)
            ? itemFieldsOf(field, stored)
            : undefined;
          return (
            <ItemRow
              key={item.id}
              heading={headingOf(field, shown, index)}
              index={index}
              count={items.length}
              onMove={move}
              onRemove={remove}
            >
              {fields ? (
                fields.map((subfield) => (
                  <NestedFieldRow
                    key={subfield.name}
                    address={`${address}.${index}.${subfield.name}`}
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
              )}
            </ItemRow>
          );
        })}
      </div>
      <div className='mt-3 flex flex-wrap gap-2'>
        {isTemplatesArray(field) ? (
          <TemplatePicker field={field} onAdd={addTemplateItem} />
        ) : (
          <AddButton
            onClick={() => addFieldsItem(field.fields, field.defaultItem)}
          >
            Add item
          </AddButton>
        )}
      </div>
    </>
  );
}

function TemplatePicker({
  field,
  onAdd,
}: {
  field: TemplatesArrayFieldSchema;
  onAdd: (template: ArrayTemplateSchema) => void;
}) {
  if (pickerOf(field) === 'list') {
    return field.templates.map((template) => (
      <AddButton key={template.name} onClick={() => onAdd(template)}>
        {`Add ${labelOf(template)}`}
      </AddButton>
    ));
  }
  return (
    <div className='grid w-full grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2'>
      {field.templates.map((template) => (
        <button
          key={template.name}
          type='button'
          aria-label={`Add ${labelOf(template)}`}
          className='flex flex-col gap-2 rounded-sm border p-2 text-left text-sm hover:border-input focus-visible:shadow-focus-ring'
          onClick={() => onAdd(template)}
        >
          {template.previewImage ? (
            <PreviewImage path={template.previewImage} />
          ) : null}
          <span className='font-medium'>{labelOf(template)}</span>
        </button>
      ))}
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
}: ItemListProps & { field: ScalarArrayFieldSchema }) {
  const registry = useFieldRegistry();
  const documentPath = useDocumentPath();
  const { getValues } = useFormContext();
  const [value, setValue] = useFieldValue<unknown[] | undefined>(address);
  const items = value ?? [];
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
    const next = [...liveItems()];
    next.splice(to, 0, ...next.splice(from, 1));
    keys.current.splice(to, 0, ...keys.current.splice(from, 1));
    setValue(next);
  };
  const remove = (index: number) => {
    keys.current = keys.current.filter((_, position) => position !== index);
    setValue(liveItems().filter((_, position) => position !== index));
  };
  const addItem = () => {
    keys.current = [...keys.current, nextScalarKey()];
    setValue([...liveItems(), seedScalar()]);
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

  return (
    <>
      <div
        role='group'
        aria-labelledby={`${address}-label`}
        className='flex flex-col gap-3'
      >
        {items.map((_, index) => (
          <ItemRow
            key={keys.current[index]}
            heading={`Item ${index + 1}`}
            index={index}
            count={items.length}
            onMove={move}
            onRemove={remove}
          >
            <NestedFieldRow address={`${address}.${index}`} node={field.of} />
          </ItemRow>
        ))}
      </div>
      <AddButton className='mt-3' onClick={addItem}>
        Add item
      </AddButton>
    </>
  );
}

interface ItemRowProps {
  heading: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  children: ReactNode;
}

function ItemRow({
  heading,
  index,
  count,
  onMove,
  onRemove,
  children,
}: ItemRowProps) {
  const position = index + 1;
  return (
    <div className='rounded-sm border p-3'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <span className='text-sm font-medium text-muted-foreground'>
          {heading}
        </span>
        <div className='flex items-center gap-1'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            aria-label={`Move item ${position} up`}
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
          >
            Up
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            aria-label={`Move item ${position} down`}
            disabled={index === count - 1}
            onClick={() => onMove(index, index + 1)}
          >
            Down
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            aria-label={`Remove item ${position}`}
            onClick={() => onRemove(index)}
          >
            Remove
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

const labelOf = (template: ArrayTemplateSchema): string =>
  template.label ?? template.name;

// A throw or a result that is not a non-empty string is no heading.
const customHeading = (
  itemLabel: ItemLabel | undefined,
  item: TinaDocument
): string | undefined => {
  try {
    const label = itemLabel?.(item);
    return typeof label === 'string' && label !== '' ? label : undefined;
  } catch {
    return undefined;
  }
};

const headingOf = (
  field: ObjectArrayFieldSchema,
  item: unknown,
  index: number
): string => {
  if (!isItem(item)) return `Item ${index + 1} is not an object`;
  if (!isTemplatesArray(field)) {
    return customHeading(field.itemLabel, item) ?? `Item ${index + 1}`;
  }
  const template = templateFor(field.templates, item);
  if (template) {
    return customHeading(template.itemLabel, item) ?? labelOf(template);
  }
  const name = item[TEMPLATE_KEY];
  return name === undefined
    ? 'Block with no template'
    : `Unknown block "${String(name)}"`;
};

let scalarKeyCount = 0;
const nextScalarKey = (): string => `scalar-item-${scalarKeyCount++}`;
