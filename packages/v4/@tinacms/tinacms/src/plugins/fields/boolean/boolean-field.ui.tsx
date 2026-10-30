import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldFrame,
  useFieldValue,
} from '../../../editor';
import { BooleanFieldView } from './boolean-field.view';

export function BooleanField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<boolean>(address);
  const frame = useFieldFrame();
  const inputRef = useRef<HTMLButtonElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <BooleanFieldView
      {...frame}
      ref={inputRef}
      id={address}
      checked={value ?? false}
      onChange={setValue}
    />
  );
}
