import { Button } from '@tinacms/ui/components/button';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { ingestDocument } from '../../../core/form/ingest';
import {
  NestedFieldRow,
  useDocumentPath,
  useFieldAddress,
  useFieldErrors,
  useFieldList,
  useFieldRegistry,
  useFieldSchema,
} from '../../../editor';
import { asArrayFieldSchema } from './array-field.schema';

export function ArrayField() {
  const address = useFieldAddress();
  const field = asArrayFieldSchema(useFieldSchema());
  const errors = useFieldErrors(address);
  const registry = useFieldRegistry();
  const documentPath = useDocumentPath();
  const { items, append, remove, move } = useFieldList(address);

  const addItem = () => {
    append(ingestDocument({}, field.fields, { documentPath, registry }));
  };

  return (
    <FieldWrapper errors={errors}>
      <div
        role='group'
        aria-labelledby={`${address}-label`}
        className='flex flex-col gap-3'
      >
        {items.map((item, index) => (
          <div key={item.id} className='rounded-md border p-3'>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <span className='text-sm font-medium text-muted-foreground'>
                Item {index + 1}
              </span>
              <div className='flex items-center gap-1'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  aria-label={`Move item ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  Up
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  aria-label={`Move item ${index + 1} down`}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  Down
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  aria-label={`Remove item ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
            {field.fields.map((subfield) => (
              <NestedFieldRow
                key={subfield.name}
                address={`${address}.${index}.${subfield.name}`}
                node={subfield}
              />
            ))}
          </div>
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
    </FieldWrapper>
  );
}
