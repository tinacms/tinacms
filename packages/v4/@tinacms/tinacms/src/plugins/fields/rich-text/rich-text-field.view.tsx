import type { RichTextValue } from '@tinacms/rich-text';
import { EditorContext, RichEditor } from '@tinacms/rich-text/editor';
import {
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
  /** The document body: the same frame, but it grows with its text and its toolbar sticks. */
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

  return (
    <FieldWrapper {...frame} labelId={labelId} disabled={disabled}>
      <div
        data-slot='rich-text-frame'
        data-active={active ? '' : undefined}
        className={cn(
          'min-w-0 rounded-sm border border-input bg-card hover:border-input-hover has-focus-visible:border-ring has-focus-visible:shadow-focus-field data-active:border-ring data-active:shadow-focus-field',
          !body && 'overflow-hidden',
          invalid &&
            'border-destructive hover:border-destructive has-focus-visible:border-destructive data-active:border-destructive',
          readOnly &&
            'border-border-subtle bg-muted hover:border-border-subtle has-focus-visible:border-border-subtle has-focus-visible:shadow-none data-active:border-border-subtle data-active:shadow-none',
          disabled &&
            'border-input hover:border-input has-focus-visible:border-input has-focus-visible:shadow-none data-active:border-input data-active:shadow-none'
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
            ariaDescribedBy={frame.help ? frame.helpId : undefined}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            layout={body ? 'body' : 'framed'}
          />
        </EditorContext.Provider>
      </div>
    </FieldWrapper>
  );
}
