import { Button } from '@tinacms/ui/components/button';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { type ReactNode, use, useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormScopeContext } from '../../../editor/context';
import type { FieldAddress } from '../../../core/field/address';
import { ingestDocument } from '../../../core/form/ingest';
import { TEMPLATE_KEY, templateFor } from '../../../core/schema/children';
import type { FieldSchema, TemplateSchema } from '../../../core/schema/types';
import {
  NestedFieldRow,
  useDocumentPath,
  useFieldAddress,
  useFieldErrors,
  useFieldRegistry,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import {
  type ObjectArrayFieldSchema,
  type ScalarArrayFieldSchema,
  asArrayFieldSchema,
  isItem,
  isScalarArray,
  isTemplatesArray,
  itemFieldsOf,
} from './array-field.schema';
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
  const errors = useFieldErrors(address);

  return (
    <FieldWrapper errors={errors}>
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
  const formScope = use(FormScopeContext);
  const { control, getValues } = useFormContext();
  const {
    fields: items,
    append,
    move,
  } = useFieldArray({
    control,
    name: address,
  });
  const removeItem = (index: number) =>
    formScope?.removeListItem(address, index);

  const seed = (template: TemplateSchema | undefined, fields: FieldSchema[]) =>
    ingestDocument(template?.defaultItem ?? {}, fields, {
      documentPath,
      registry,
    });
  const addFieldsItem = (fields: FieldSchema[]) =>
    append(seed(undefined, fields));
  const addTemplateItem = (template: TemplateSchema) =>
    append({
      [TEMPLATE_KEY]: template.name,
      ...seed(template, template.fields),
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
          const fields = isItem(stored)
            ? itemFieldsOf(field, stored)
            : undefined;
          return (
            <ItemRow
              key={item.id}
              heading={headingOf(field, stored, index)}
              index={index}
              count={items.length}
              onMove={move}
              onRemove={removeItem}
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
          field.templates.map((template) => (
            <Button
              key={template.name}
              type='button'
              variant='outline'
              onClick={() => addTemplateItem(template)}
            >
              Add {labelOf(template)}
            </Button>
          ))
        ) : (
          <Button
            type='button'
            variant='outline'
            onClick={() => addFieldsItem(field.fields)}
          >
            Add item
          </Button>
        )}
      </div>
    </>
  );
}

function ScalarItems({
  address,
  field,
}: ItemListProps & { field: ScalarArrayFieldSchema }) {
  const registry = useFieldRegistry();
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
    setValue([
      ...liveItems(),
      registry.get(field.of.type)?.defaultValue ?? null,
    ]);
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
      <Button
        type='button'
        variant='outline'
        className='mt-3'
        onClick={addItem}
      >
        Add item
      </Button>
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
    <div className='rounded-md border p-3'>
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

const labelOf = (template: TemplateSchema): string =>
  template.label ?? template.name;

const headingOf = (
  field: ObjectArrayFieldSchema,
  item: unknown,
  index: number
): string => {
  if (!isItem(item)) return `Item ${index + 1} is not an object`;
  if (!isTemplatesArray(field)) return `Item ${index + 1}`;
  const template = templateFor(field.templates, item);
  if (template) return labelOf(template);
  const name = item[TEMPLATE_KEY];
  return name === undefined
    ? 'Block with no template'
    : `Unknown block "${String(name)}"`;
};

let scalarKeyCount = 0;
const nextScalarKey = (): string => `scalar-item-${scalarKeyCount++}`;
