import {
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';
import { Textarea } from '@tinacms/ui/components/textarea';

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
  placeholder?: string;
  multiline?: boolean;
  mono?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
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
  placeholder,
  multiline = false,
  mono = false,
  disabled = false,
  readOnly = false,
  ref,
  ...frame
}: StringFieldViewProps) {
  const errors = frame.errors ?? [];
  const control = {
    id,
    value,
    placeholder,
    disabled,
    readOnly,
    mono,
    required: frame.required,
    onBlur,
    'aria-invalid': errors.length > 0 || undefined,
    'aria-describedby': frame.help ? frame.helpId : undefined,
    // The wrapper already fades a disabled field, so the box must not fade again.
    className: 'disabled:opacity-100',
  };

  return (
    <FieldWrapper {...frame} disabled={disabled}>
      {multiline ? (
        <Textarea
          {...control}
          ref={ref}
          onChange={(event) => onChange?.(event.target.value)}
        />
      ) : (
        <Input
          {...control}
          ref={ref}
          className={`${control.className} text-ellipsis`}
          onChange={(event) => onChange?.(event.target.value)}
        />
      )}
    </FieldWrapper>
  );
}
