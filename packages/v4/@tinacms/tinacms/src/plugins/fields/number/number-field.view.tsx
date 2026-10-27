import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { Icon } from '@tinacms/ui/components/icon';
import { Input } from '@tinacms/ui/components/input';
import { cn } from '@tinacms/ui/lib/utils';
import { type Ref, useRef } from 'react';
import {
  atLimit,
  type StepDirection,
  type StepLimits,
  stepValue,
} from './number-field.step';

export interface NumberFieldViewProps
  extends Pick<
      FieldWrapperProps,
      | 'label'
      | 'htmlFor'
      | 'labelId'
      | 'required'
      | 'errors'
      | 'help'
      | 'helpId'
      | 'warnings'
    >,
    StepLimits {
  id: string;
  /** The text in the box; `null` when empty. */
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  ref?: Ref<HTMLInputElement>;
}

const stepButton =
  'flex h-1/2 w-6 cursor-pointer items-center justify-center rounded-xs border-0 bg-transparent p-0 text-muted-foreground outline-none hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-45';

/** The number box and its step buttons inside the Field wrapper. It holds no editor state. */
export function NumberFieldView({
  label,
  htmlFor,
  labelId,
  required,
  errors,
  help,
  helpId,
  warnings,
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  step,
  disabled,
  readOnly,
  ref,
}: NumberFieldViewProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const editable = !disabled && !readOnly;
  const limits = { min, max };

  const stepBy = (direction: StepDirection) => {
    const next = stepValue(value, direction, step, limits);
    if (next !== null) onChange(next);
  };

  const buttons: { direction: StepDirection; name: string }[] = [
    { direction: 'up', name: 'Increase' },
    { direction: 'down', name: 'Decrease' },
  ];

  return (
    <FieldWrapper
      label={label}
      htmlFor={htmlFor}
      labelId={labelId}
      required={required}
      errors={errors}
      help={help}
      helpId={helpId}
      warnings={warnings}
      disabled={disabled}
    >
      <div className='relative w-28 max-w-full'>
        <Input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          id={id}
          type='number'
          inputMode='decimal'
          step={step ?? 'any'}
          value={value ?? ''}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={help ? helpId : undefined}
          className={cn(
            'appearance-none tabular-nums disabled:opacity-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]',
            editable && 'pr-8'
          )}
          onChange={(event) =>
            onChange(event.target.value === '' ? null : event.target.value)
          }
          onBlur={onBlur}
          onWheel={(event) => event.currentTarget.blur()}
          onKeyDown={(event) => {
            if (!editable) return;
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault();
              stepBy(event.key === 'ArrowUp' ? 'up' : 'down');
            }
          }}
        />
        {editable ? (
          <div className='absolute inset-y-0 right-1 flex flex-col justify-center'>
            {buttons.map(({ direction, name }) => (
              <button
                key={direction}
                type='button'
                tabIndex={-1}
                aria-label={name}
                disabled={atLimit(value, direction, limits)}
                className={stepButton}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  inputRef.current?.focus();
                  stepBy(direction);
                }}
              >
                <Icon
                  glyph='chevron-down'
                  size={12}
                  className={direction === 'up' ? 'rotate-180' : undefined}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </FieldWrapper>
  );
}
