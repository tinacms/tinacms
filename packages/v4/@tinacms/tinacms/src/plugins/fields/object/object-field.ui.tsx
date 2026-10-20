import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import {
  NestedFieldRow,
  useFieldAddress,
  useFieldErrors,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import { UneditableValue } from '../uneditable-value';
import { asObjectFieldSchema, isPlainObject } from './object-field.schema';

export function ObjectField() {
  const [value] = useFieldValue<unknown>(useFieldAddress());
  // Absent objects stay collapsed. Rendering nested controls under null would
  // register empty child fields in the form store and revive a blank object.
  if (value == null) {
    return null;
  }
  return isPlainObject(value) ? (
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
  const errors = useFieldErrors(address);

  return (
    <FieldWrapper errors={errors}>
      <div
        role='group'
        aria-labelledby={`${address}-label`}
        className='rounded-md border p-3'
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
