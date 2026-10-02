import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tinacms/ui/components/select';
import { useRef } from 'react';
import { hasValidator } from '../../../core/schema/types';
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
  const [value, setValue] = useFieldValue<string | null>(address);
  const errors = useFieldErrors(address);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useFieldActivation(() => triggerRef.current?.focus());

  const noneItem = { value: '', label: 'None' };
  const optionItems = field.options.map((option) => ({
    value: option.value,
    label: option.label ?? option.value,
  }));
  const isRequired = hasValidator(field, 'required');
  const items = isRequired ? optionItems : [noneItem, ...optionItems];

  return (
    <FieldWrapper errors={errors}>
      <Select
        items={items}
        value={value ?? null}
        onValueChange={(newValue) =>
          setValue(newValue === '' ? null : newValue)
        }
      >
        <SelectTrigger ref={triggerRef} id={address}>
          <SelectValue placeholder='Select...' />
        </SelectTrigger>
        <SelectContent>
          {isRequired ? null : (
            <SelectItem value={noneItem.value}>{noneItem.label}</SelectItem>
          )}
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
