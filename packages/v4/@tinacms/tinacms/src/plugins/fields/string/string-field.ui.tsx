import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldFrame,
  useFieldValue,
} from '../../../editor';

export function StringField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string>(address);
  const frame = useFieldFrame();
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <FieldWrapper {...frame}>
      <Input
        ref={inputRef}
        id={address}
        value={value ?? ''}
        onChange={(event) => setValue(event.target.value)}
      />
    </FieldWrapper>
  );
}
