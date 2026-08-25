import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tinacms/ui/components/select';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import type { SelectFieldSchema } from './select-field.schema';

export function SelectField() {
  const address = useFieldAddress();
  const field = useFieldSchema<SelectFieldSchema>();
  const [value, setValue] = useFieldValue<string>(address);
  const errors = useFieldErrors(address);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useFieldActivation(() => triggerRef.current?.focus());

  const items = field.options.map((option) => ({
    value: option.value,
    label: option.label ?? option.value,
  }));

  return (
    <FieldWrapper errors={errors}>
      <Select
        items={items}
        value={value ?? null}
        onValueChange={(newValue) => setValue(newValue ?? undefined)}
      >
        <SelectTrigger ref={triggerRef} id={address}>
          <SelectValue placeholder='Select...' />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label ?? option.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
