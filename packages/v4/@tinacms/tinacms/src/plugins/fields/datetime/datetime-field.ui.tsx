import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from '../../../editor';

// ponytail: no zone math — a stored `Z` time shows as wall clock. Convert to the
const toInputValue = (stored: string | undefined): string => {
  if (!stored) return '';
  return stored.includes('T') ? stored.slice(0, 16) : `${stored}T00:00`;
};

export function DatetimeField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string | undefined>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <FieldWrapper errors={errors}>
      <Input
        ref={inputRef}
        type='datetime-local'
        id={address}
        aria-label={address}
        value={toInputValue(value)}
        onChange={(event) =>
          setValue(event.target.value === '' ? undefined : event.target.value)
        }
      />
    </FieldWrapper>
  );
}
