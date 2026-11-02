import { use, useEffect, useState } from 'react';
import { get, useFormState, useWatch } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from 'zustand';
import { invariant } from '../../../core/invariant';
import { FormScopeContext } from '../../../editor/context';
import { ownFieldErrors } from '../../../editor/field-errors';
import {
  countRevealedErrors,
  isRevealed,
} from '../../../editor/form-view-state';
import {
  NestedFieldRow,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
  useFormErrors,
  useFormId,
  useActiveField,
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

function useScope() {
  const scope = use(FormScopeContext);
  invariant(
    scope,
    'object-field-outside-provider',
    'The object field must be used within a FormProvider'
  );
  return scope;
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
  const frame = useFieldFrame();
  const { view } = useScope();
  const summary = useSummary(address, field.fields);
  const { errors } = useFormState({ name: address });
  const flat = useFormErrors(useFormId());
  const ownMessages = ownFieldErrors(get(errors, address), address)[address];
  const ownRevealed = useStore(
    view,
    (state) => ownMessages !== undefined && isRevealed(state, address)
  );
  const invalidCount = useStore(
    view,
    useShallow((state) =>
      countRevealedErrors(state, Object.keys(flat), address)
    )
  );
  return {
    address,
    field,
    frame: { ...frame, errors: ownRevealed ? (ownMessages ?? []) : [] },
    invalidCount,
    summary,
  };
}

function FieldGroup() {
  const { address, field, frame, invalidCount, summary } = useObjectSummary();
  const { view } = useScope();
  const { active } = useActiveField();
  const [open, setOpen] = useState(false);
  const isOpenLevel =
    useStore(view, (state) => state.openLevels.at(-1)?.address) === address;

  // Matches the object or anything under it, so a preview click on a folded
  // field opens the fold before the field takes focus.
  useEffect(() => {
    if (active === address || active?.startsWith(`${address}.`)) setOpen(true);
  }, [active, address]);

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
  const { address, field, frame, invalidCount, summary } = useObjectSummary();
  const { view } = useScope();
  const node = useFieldSchema();
  return (
    <ObjectFieldView
      {...frame}
      display='drillIn'
      summary={summary}
      invalidCount={invalidCount}
      onDrillIn={() =>
        view.getState().openLevel({
          address,
          label: field.label ?? field.name,
          node,
        })
      }
    />
  );
}
