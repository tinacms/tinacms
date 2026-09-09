import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Label } from '@tinacms/ui/components/label';
import { toFieldAddress } from '../../../core/field/address';
import type { FieldSchema } from '../../../core/schema/types';
import {
  FieldNode,
  useFieldAddress,
  useFieldErrors,
  useFieldRegistry,
  useFieldSchema,
} from '../../../editor';
import { asObjectFieldSchema } from './object-field.schema';

function ObjectFieldRow({
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
          <ObjectFieldRow
            key={subfield.name}
            address={`${address}.${subfield.name}`}
            node={subfield}
          />
        ))}
      </div>
    </FieldWrapper>
  );
}
