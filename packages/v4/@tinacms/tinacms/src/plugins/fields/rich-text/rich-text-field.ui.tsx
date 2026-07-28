import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldSchema,
  useFieldValue,
  useFormId,
} from '../../../editor';
import { RichEditor } from './plate';
import { EditorContext } from './plate/editor-context';
import type {
  RichTextAst,
  RichTextFieldSchema,
} from './rich-text-field.schema';

const EMPTY_AST: RichTextAst = { type: 'root', children: [] };

// Raw-mode is not ported: v4 has no raw markdown editor to switch to, so the
// affordances that would call this are hidden (fixed-toolbar-buttons.tsx, and
// the invalid-markdown card). Wiring it needs a raw editor, not just this
// setter, which is why the context still carries the shape.
const RAW_MODE_UNAVAILABLE = false;
const setRawModeUnavailable = () => {};

export function RichTextField() {
  const address = useFieldAddress();
  const formId = useFormId();
  const field = useFieldSchema<RichTextFieldSchema>();
  const [value, setValue] = useFieldValue<RichTextAst>(address);
  const errors = useFieldErrors(address);
  const containerRef = useRef<HTMLDivElement>(null);

  const editable = () =>
    containerRef.current?.querySelector<HTMLElement>('[role="textbox"]');

  // Plate doesn't expose its contenteditable as a ref, so activation queries for
  // it. Slate mounts a tick after us, hence the deferral.
  useFieldActivation(() => {
    setTimeout(() => editable()?.focus(), 0);
  });

  return (
    <FieldWrapper errors={errors}>
      {/* Plate owns its own state once mounted and only reads `value` as a seed,
          so switching documents has to remount it. formId is the document's
          identity (toFormId(path)), and the provider resets react-hook-form in
          place without remounting — without this key the editor would keep the
          previous document's body and save it into the new file. */}
      <div ref={containerRef}>
        <EditorContext.Provider
          key={formId}
          value={{
            fieldName: address,
            templates: field.templates ?? [],
            rawMode: RAW_MODE_UNAVAILABLE,
            setRawMode: setRawModeUnavailable,
          }}
        >
          <RichEditor
            input={{ value: value ?? EMPTY_AST, onChange: setValue }}
            field={field}
            ariaLabel={address}
          />
        </EditorContext.Provider>
      </div>
    </FieldWrapper>
  );
}
