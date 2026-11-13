import type { RichTextValue } from '@tinacms/rich-text';
import { EditorContext, RichEditor } from '@tinacms/rich-text/editor';
import {
  FieldMessage,
  FieldWrapper,
  type FieldWrapperProps,
} from '@tinacms/ui/components/field-wrapper';
import { cn } from '@tinacms/ui/lib/utils';
import type { RichTextFieldSchema } from './rich-text-field.schema';

export type RichTextFieldViewProps = Pick<
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
  value: RichTextValue;
  onChange?: (value: RichTextValue) => void;
  field: Pick<RichTextFieldSchema, 'templates' | 'overrides'>;
  onActivateEmbed?: (address: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** The page is pointing at this field: draw it like focus. */
  active?: boolean;
  /** No frame and no visible label, for the document body. The live field never sets it. */
  body?: boolean;
};

const noop = () => {};

export function RichTextFieldView({
  id,
  value,
  onChange = noop,
  field,
  onActivateEmbed = noop,
  placeholder = 'Start writing…',
  disabled = false,
  readOnly = false,
  body = false,
  active = false,
  ...frame
}: RichTextFieldViewProps) {
  const labelId = frame.labelId ?? `${id}-label`;
  const invalid = !!frame.errors?.length;

  const editor = (
    <div
      data-slot='rich-text-frame'
      data-active={active && !body ? '' : undefined}
      className={cn(
        'min-w-0 overflow-hidden rounded-sm',
        !body &&
          'border border-input bg-card hover:border-input-hover has-focus-visible:border-ring has-focus-visible:shadow-focus-field data-active:border-ring data-active:shadow-focus-field',
        !body &&
          disabled &&
          'hover:border-input data-active:border-input data-active:shadow-none',
        !body &&
          readOnly &&
          'border-border-subtle bg-muted hover:border-border-subtle data-active:border-border-subtle data-active:shadow-none',
        !body &&
          invalid &&
          'border-destructive hover:border-destructive data-active:border-destructive'
      )}
    >
      <EditorContext.Provider
        value={{
          fieldName: id,
          templates: field.templates ?? [],
          rawMode: false,
          setRawMode: noop,
          onActivateField: onActivateEmbed,
        }}
      >
        <RichEditor
          input={{ value, onChange }}
          field={field}
          ariaLabelledBy={labelId}
          ariaInvalid={invalid}
          ariaDescribedBy={!body && frame.help ? frame.helpId : undefined}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          layout={body ? 'body' : 'framed'}
        />
      </EditorContext.Provider>
    </div>
  );

  if (!body) {
    return (
      <FieldWrapper {...frame} labelId={labelId} disabled={disabled}>
        {editor}
      </FieldWrapper>
    );
  }

  return (
    <div className='flex w-full min-w-0 flex-col gap-1.5'>
      <span id={labelId} className='sr-only'>
        {frame.label}
        {frame.required ? ' (required)' : null}
      </span>
      {frame.errors?.map((text) => (
        <FieldMessage key={`e-${text}`}>{text}</FieldMessage>
      ))}
      {frame.warnings?.map((text) => (
        <FieldMessage key={`w-${text}`} tone='warning'>
          {text}
        </FieldMessage>
      ))}
      {editor}
    </div>
  );
}
