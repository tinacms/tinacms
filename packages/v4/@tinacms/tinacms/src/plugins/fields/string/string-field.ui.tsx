import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from '../../../editor';

export function StringField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <FieldWrapper errors={errors}>
      <Input
        ref={inputRef}
        aria-label={address}
        value={value ?? ''}
        onChange={(event) => setValue(event.target.value)}
      />
    </FieldWrapper>
  );
}
