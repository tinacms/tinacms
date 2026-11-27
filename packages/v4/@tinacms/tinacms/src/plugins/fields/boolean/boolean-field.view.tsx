import { Checkbox } from '@tinacms/ui/components/checkbox';
import {
  FieldHelp,
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { Label } from '@tinacms/ui/components/label';
import { cn } from '@tinacms/ui/lib/utils';
import type { Ref } from 'react';

const ACTIVE_LOOK =
  'data-active:border-ring data-active:shadow-focus-field data-active:data-checked:border-ring aria-invalid:data-active:border-destructive aria-invalid:data-active:data-checked:border-destructive data-disabled:data-active:border-border data-disabled:data-active:data-checked:border-border data-disabled:data-active:shadow-none data-readonly:data-active:border-border data-readonly:data-active:data-checked:border-border data-readonly:data-active:shadow-none';

export interface BooleanFieldViewProps
  extends Pick<
    FieldWrapperProps,
    'label' | 'labelId' | 'errors' | 'help' | 'helpId' | 'warnings'
  > {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** The page is pointing at this field: draw it like focus. */
  active?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * The checkbox with its label beside it and its help under the label, inside the
 * Field wrapper. The wrapper's own label and help sit above the control, so they
 * are drawn here instead. It holds no editor state.
 */
export function BooleanFieldView({
  label,
  labelId,
  errors,
  help,
  helpId,
  warnings,
  id,
  checked,
  onChange,
  disabled,
  readOnly,
  active,
  ref,
}: BooleanFieldViewProps) {
  const editable = !disabled && !readOnly;

  return (
    <FieldWrapper errors={errors} warnings={warnings} disabled={disabled}>
      <div className='flex items-start gap-2'>
        <Checkbox
          ref={ref}
          id={id}
          checked={checked}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={help ? helpId : undefined}
          data-active={active ? '' : undefined}
          className={cn('mt-0.5', ACTIVE_LOOK)}
          onCheckedChange={(next) => {
            if (editable) onChange(next === true);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || !editable) return;
            event.preventDefault();
            if (!event.repeat) onChange(!checked);
          }}
        />
        <div className='flex min-w-0 flex-col gap-0.5'>
          <Label
            kind='inline'
            id={labelId}
            htmlFor={id}
            className={cn(!editable && 'cursor-default')}
          >
            {label}
          </Label>
          {help ? <FieldHelp id={helpId}>{help}</FieldHelp> : null}
        </div>
      </div>
    </FieldWrapper>
  );
}
