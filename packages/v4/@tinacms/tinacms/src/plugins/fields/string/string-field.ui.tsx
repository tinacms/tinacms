import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldActive,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import type { StringFieldSchema } from './string-field.schema';
import { StringFieldView } from './string-field.view';

export function StringField() {
  const address = useFieldAddress();
  const { multiline, mono, placeholder } = useFieldSchema<StringFieldSchema>();
  const [value, setValue] = useFieldValue<string>(address);
  const frame = useFieldFrame();
  const active = useFieldActive();
  const boxRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useFieldActivation(() => boxRef.current?.focus());

  return (
    <StringFieldView
      {...frame}
      active={active}
      ref={(box) => {
        boxRef.current = box;
      }}
      id={address}
      value={value ?? ''}
      onChange={setValue}
      multiline={multiline}
      mono={mono}
      placeholder={placeholder}
    />
  );
}
