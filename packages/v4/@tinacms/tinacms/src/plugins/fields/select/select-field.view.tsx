import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tinacms/ui/components/select';
import type { Ref } from 'react';

export interface SelectFieldViewItem {
  value: string;
  label: string;
  /** Greyed and not pickable. */
  disabled?: boolean;
  /** Shown as the option's tooltip. */
  hint?: string;
}

export type SelectFieldViewProps = Pick<
  FieldWrapperProps,
  | 'label'
  | 'htmlFor'
  | 'labelId'
  | 'required'
  | 'errors'
  | 'help'
  | 'helpId'
  | 'warnings'
> & {
  id: string;
  items: SelectFieldViewItem[];
  value: string | null;
  /** `null` when the "None" row is picked. */
  onChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

const NONE: SelectFieldViewItem = { value: '', label: 'None' };

/**
 * The Select field's trigger and list inside the Field Wrapper, with no editor
 * state. `SelectField` feeds it from the form; the state catalogue feeds it by hand.
 * An optional field gets a "None" row, which is the only way to clear a value.
 */
export function SelectFieldView({
  id,
  items,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  readOnly = false,
  ref,
  ...frame
}: SelectFieldViewProps) {
  const required = !!frame.required;
  const rows: SelectFieldViewItem[] = required ? items : [NONE, ...items];

  return (
    <FieldWrapper {...frame} disabled={disabled}>
      <Select
        items={rows}
        value={value}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onValueChange={(next) => onChange?.(next === '' ? null : next)}
      >
        <SelectTrigger
          ref={ref}
          id={id}
          className='w-full disabled:opacity-100'
          aria-invalid={frame.errors?.length ? true : undefined}
          aria-describedby={frame.help ? frame.helpId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {rows.map((row) => (
            <SelectItem
              key={row.value}
              value={row.value}
              disabled={row.disabled}
              title={row.hint}
            >
              {row.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
