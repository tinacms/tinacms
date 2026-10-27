import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import {
  NestedFieldRow,
  useDrillIn,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import { DrillInField } from '../drill-in-field';
import { UneditableValue } from '../uneditable-value';
import { asObjectFieldSchema, isPlainObject } from './object-field.schema';

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

function FieldGroup() {
  const address = useFieldAddress();
  const field = asObjectFieldSchema(useFieldSchema());
  const frame = useFieldFrame();
  const drill = useDrillIn();

  if (drill.drills) return <DrillInField frame={frame} open={drill.open} />;

  return (
    <FieldWrapper {...frame}>
      <div
        role='group'
        aria-labelledby={`${address}-label`}
        className='rounded-sm border p-3'
      >
        {field.fields.map((subfield) => (
          <NestedFieldRow
            key={subfield.name}
            address={`${address}.${subfield.name}`}
            node={subfield}
          />
        ))}
      </div>
    </FieldWrapper>
  );
}
