import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import {
  NestedFieldRow,
  useFieldAddress,
  useFieldErrors,
  useFieldSchema,
} from '../../../editor';
import { asObjectFieldSchema } from './object-field.schema';

export function ObjectField() {
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
