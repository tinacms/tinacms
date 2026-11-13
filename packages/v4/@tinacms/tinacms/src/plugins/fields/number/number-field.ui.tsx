import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldActive,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import type { NumberFieldSchema } from './number-field.schema';
import { limitOf } from './number-field.step';
import { NumberFieldView } from './number-field.view';

export function NumberField() {
  const address = useFieldAddress();
  const field = useFieldSchema<NumberFieldSchema>();
  const [value, setValue] = useFieldValue<string | null>(address);
  const frame = useFieldFrame();
  const active = useFieldActive();
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <NumberFieldView
      {...frame}
      active={active}
      ref={inputRef}
      id={address}
      value={typeof value === 'string' ? value : null}
      onChange={setValue}
      min={limitOf(field, 'min')}
      max={limitOf(field, 'max')}
      step={field.step}
    />
  );
}
