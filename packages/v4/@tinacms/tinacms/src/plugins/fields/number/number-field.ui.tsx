import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import type { NumberFieldSchema } from './number-field.schema';

export function NumberField() {
  const address = useFieldAddress();
  const field = useFieldSchema<NumberFieldSchema>();
  const [value, setValue] = useFieldValue<string | null>(address);
  const frame = useFieldFrame();
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <FieldWrapper {...frame}>
      <Input
        ref={inputRef}
        type='number'
        step={field.step ?? 'any'}
        id={address}
        value={value ?? ''}
        onChange={(event) =>
          setValue(event.target.value === '' ? null : event.target.value)
        }
        onWheel={(event) => event.currentTarget.blur()}
      />
    </FieldWrapper>
  );
}
