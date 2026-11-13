import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';
import { Textarea } from '@tinacms/ui/components/textarea';
import { cn } from '@tinacms/ui/lib/utils';

export type StringFieldViewProps = Pick<
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
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  /** One message from outside the form, such as a name already taken. It shows with the field's errors. */
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  mono?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** The page is pointing at this field: draw it like focus. */
  active?: boolean;
  ref?: (box: HTMLInputElement | HTMLTextAreaElement | null) => void;
};

/**
 * The String field's box inside the Field Wrapper, with no editor state.
 * `StringField` feeds it from the form; the state catalogue feeds it by hand.
 */
export function StringFieldView({
  id,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  multiline = false,
  mono = false,
  disabled = false,
  readOnly = false,
  active = false,
  ref,
  ...frame
}: StringFieldViewProps) {
  const errors = [...(frame.errors ?? []), ...(error ? [error] : [])];
  const control = {
    id,
    value,
    placeholder,
    disabled,
    readOnly,
    mono,
    required: frame.required,
    onBlur,
    'data-active': active ? '' : undefined,
    'aria-invalid': errors.length > 0 || undefined,
    'aria-describedby': frame.help ? frame.helpId : undefined,
    onChange: (event: { target: { value: string } }) =>
      onChange?.(event.target.value),
  };

  return (
    <FieldWrapper {...frame} errors={errors} disabled={disabled}>
      {multiline ? (
        <Textarea {...control} ref={ref} className='disabled:opacity-100' />
      ) : (
        <Input
          {...control}
          ref={ref}
          className={cn('text-ellipsis', 'disabled:opacity-100')}
        />
      )}
    </FieldWrapper>
  );
}
