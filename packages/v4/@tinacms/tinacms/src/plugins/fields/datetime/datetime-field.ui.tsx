import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from '../../../editor';

// The native input wants `YYYY-MM-DDTHH:mm` exactly. A stored value can be longer
// (seconds, a zone) or shorter (a date with no time), and either shape would render
// as an empty input. This normalises for display only. The stored value does not
// change until the author edits.
//
// ponytail: no zone math — a stored `Z` time shows as wall clock. Convert to the
// zone of the author when a team asks for it.
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
