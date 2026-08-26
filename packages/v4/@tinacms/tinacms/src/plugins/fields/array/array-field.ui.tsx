import { Button } from '@tinacms/ui/components/button';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Label } from '@tinacms/ui/components/label';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { toFieldAddress } from '../../../core/field/address';
import { ingestDocument } from '../../../core/form/ingest';
import type { FieldSchema, TinaDocument } from '../../../core/schema/types';
import {
  FieldNode,
  useDocumentPath,
  useFieldAddress,
  useFieldErrors,
  useFieldRegistry,
  useFieldSchema,
} from '../../../editor';
import type { ArrayFieldSchema } from './array-field.schema';

function ItemFieldRow({
  address,
  node,
}: {
  address: string;
  node: FieldSchema;
}) {
  const labelable =
    useFieldRegistry().get(node.type)?.metadata?.labelable !== false;
  return (
    <div className='mb-3 min-w-0 last:mb-0'>
      <Label
        className='mb-1'
        id={`${address}-label`}
        htmlFor={labelable ? address : undefined}
      >
        {node.label ?? node.name}
      </Label>
      <FieldNode address={toFieldAddress(address)} node={node} />
    </div>
  );
}

export function ArrayField() {
  const address = useFieldAddress();
  const field = useFieldSchema<ArrayFieldSchema>();
  const errors = useFieldErrors(address);
  const registry = useFieldRegistry();
  const documentPath = useDocumentPath();
  const { control } = useFormContext();
  const {
    fields: items,
    append,
    remove,
    move,
  } = useFieldArray({ control, name: address });

  const addItem = () => {
    const item = ingestDocument({}, field.fields, registry, {
      documentPath,
      registry,
    });
    append(item as TinaDocument);
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
              <ItemFieldRow
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
