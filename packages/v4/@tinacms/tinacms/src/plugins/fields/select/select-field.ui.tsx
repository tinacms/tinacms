import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import type { SelectFieldSchema } from './select-field.schema';
import { SelectFieldView } from './select-field.view';

export function SelectField() {
  const address = useFieldAddress();
  const field = useFieldSchema<SelectFieldSchema>();
  const [value, setValue] = useFieldValue<string | null>(address);
  const frame = useFieldFrame();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useFieldActivation(() => triggerRef.current?.focus());

  return (
    <SelectFieldView
      {...frame}
      ref={triggerRef}
      id={address}
      items={field.options.map((option) => ({
        value: option.value,
        label: option.label ?? option.value,
      }))}
      value={value ?? null}
      onChange={setValue}
    />
  );
}
