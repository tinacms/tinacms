import { Checkbox } from '@tinacms/ui/components/checkbox';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from '../../../editor';

export function BooleanField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<boolean>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLButtonElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <FieldWrapper errors={errors}>
      <Checkbox
        ref={inputRef}
        aria-label={address}
        checked={value ?? false}
        onCheckedChange={(checked) => setValue(checked === true)}
      />
    </FieldWrapper>
  );
}
