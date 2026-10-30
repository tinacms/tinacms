import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';
import type { Ref } from 'react';

export type DatetimeFieldViewProps = Pick<
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
  /** The input string, `YYYY-MM-DDTHH:mm`; `''` when empty or partly typed. */
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  ref?: Ref<HTMLInputElement>;
};

/**
 * The date and time box inside the Field Wrapper, with no editor state.
 * `DatetimeField` feeds it from the form and owns the zone work; the state
 * catalogue feeds it by hand.
 */
export function DatetimeFieldView({
  id,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  ref,
  ...frame
}: DatetimeFieldViewProps) {
  const editable = !disabled && !readOnly;

  return (
    <FieldWrapper {...frame} disabled={disabled}>
      <div className='w-60 max-w-full'>
        <Input
          ref={ref}
          id={id}
          type='datetime-local'
          value={value}
          required={frame.required}
          disabled={disabled}
          readOnly={readOnly}
          data-empty={value === '' ? '' : undefined}
          aria-invalid={frame.errors?.length ? true : undefined}
          aria-describedby={frame.help ? frame.helpId : undefined}
          className='tabular-nums disabled:opacity-100 data-[empty]:text-muted-foreground [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:rounded-xs [&::-webkit-calendar-picker-indicator]:hover:bg-muted disabled:[&::-webkit-calendar-picker-indicator]:cursor-default disabled:[&::-webkit-calendar-picker-indicator]:hover:bg-transparent data-[readonly]:[&::-webkit-calendar-picker-indicator]:hidden'
          onChange={(event) => {
            if (editable) onChange?.(event.target.value);
          }}
        />
      </div>
    </FieldWrapper>
  );
}
