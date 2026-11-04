import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import {
  NestedFieldRow,
  useActivation,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
  useInvalidFieldCount,
  useIsOpenLevel,
  useOpenLevel,
} from '../../../editor';
import { UneditableValue } from '../uneditable-value';
import {
  asObjectFieldSchema,
  displayOf,
  isPlainObject,
} from './object-field.schema';
import { ObjectFieldView } from './object-field.view';

export function ObjectField() {
  const [value] = useFieldValue<unknown>(useFieldAddress());
  return value == null || isPlainObject(value) ? (
    <FieldGroup />
  ) : (
    <UneditableValue
      problem='This value is not a group of fields, so it cannot be edited here.'
      cleared={null}
    />
  );
}

// The first visible text field that has something typed in it. It watches the
// text fields one by one: react-hook-form edits the object in place, so the
// object itself never changes identity.
function useSummary(
  address: string,
  fields: ReturnType<typeof asObjectFieldSchema>['fields']
): string | undefined {
  const texts = fields.filter(
    (field) => !field.hidden && field.type === 'string'
  );
  const values: unknown[] = useWatch({
    name: texts.map((field) => `${address}.${field.name}`),
  });
  return values.find(
    (entry): entry is string => typeof entry === 'string' && entry.trim() !== ''
  );
}

// What the object shows about itself: its own errors only (each child shows
// its own), how many fields inside are invalid, and its summary line.
function useObjectSummary() {
  const address = useFieldAddress();
  const field = asObjectFieldSchema(useFieldSchema());
  const frame = useFieldFrame({ ownErrorsOnly: true });
  const summary = useSummary(address, field.fields);
  const invalidCount = useInvalidFieldCount();
  return { address, field, frame, invalidCount, summary };
}

function FieldGroup() {
  const { address, field, frame, invalidCount, summary } = useObjectSummary();
  const activation = useActivation();
  const [open, setOpen] = useState(false);
  const isOpenLevel = useIsOpenLevel();

  useEffect(() => {
    const target = activation?.address;
    if (target === address || target?.startsWith(`${address}.`)) setOpen(true);
  }, [activation, address]);

  return (
    <ObjectFieldView
      {...frame}
      display={displayOf(field)}
      inPlace={isOpenLevel}
      open={open}
      onOpenChange={setOpen}
      summary={summary}
      invalidCount={invalidCount}
      onHeaderFocus={(event) => event.stopPropagation()}
    >
      {field.fields.map((subfield) => (
        <NestedFieldRow
          key={subfield.name}
          address={`${address}.${subfield.name}`}
          node={subfield}
        />
      ))}
    </ObjectFieldView>
  );
}

// Drawn in place of the field where it drills in.
export function ObjectDrillIn() {
  const { field, frame, invalidCount, summary } = useObjectSummary();
  const openLevel = useOpenLevel();
  return (
    <ObjectFieldView
      {...frame}
      display='drillIn'
      name={field.name}
      summary={summary}
      invalidCount={invalidCount}
      onDrillIn={openLevel}
    />
  );
}
