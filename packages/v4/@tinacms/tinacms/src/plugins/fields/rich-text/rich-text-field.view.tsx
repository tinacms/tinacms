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
  /** The field address, which also names the embeds' forms. */
  id: string;
  value: RichTextValue;
  onChange?: (value: RichTextValue) => void;
  field: Pick<RichTextFieldSchema, 'templates' | 'overrides'>;
  /** Called with an embed's address when its label is clicked. */
  onActivateEmbed?: (address: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** No frame and no visible label, for the document body. The live field never sets it. */
  body?: boolean;
};

const noop = () => {};

/**
 * The rich-text editor inside its frame, with no form state. `RichTextField`
 * feeds it from the form; the state catalogue feeds it by hand. The editor
 * is named by the label, which stays as screen-reader text in `body` mode.
 */
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
  ...frame
}: RichTextFieldViewProps) {
  const labelId = frame.labelId ?? `${id}-label`;
  const invalid = !!frame.errors?.length;

  const editor = (
    <div
      data-slot='rich-text-frame'
      className={cn(
        'min-w-0 overflow-hidden rounded-sm',
        !body &&
          'border border-input bg-card hover:border-input-hover has-focus-visible:border-ring has-focus-visible:shadow-focus-field',
        !body && invalid && 'border-destructive hover:border-destructive',
        !body &&
          readOnly &&
          'border-border-subtle bg-muted hover:border-border-subtle'
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
