import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { useCallback, useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldSchema,
  useFieldValue,
  useFormId,
} from '../../../editor';
import { codecFor } from './mdx-codec';
import { RichEditor } from './plate';
import { EditorContext } from './plate/editor-context';
import { EMPTY_RICH_TEXT, type RichTextValue } from './rich-text-codec';
import type { RichTextFieldSchema } from './rich-text-field.schema';

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
  const [value, setValue] = useFieldValue<RichTextValue>(address);
  const errors = useFieldErrors(address);
  const containerRef = useRef<HTMLDivElement>(null);

  // Plate fires onChange for selection changes too, not just edits, and its
  // normalization (NodeIdPlugin stamps an `id` on every node, TrailingBlockPlugin
  // appends an empty paragraph) means the mounted document never structurally
  // matches the one read off disk. Comparing documents would therefore report an
  // edit on a mere click; the form store compares by reference (form-store.ts
  // `valuesEqual`), so that edit would stick and the document could never return
  // to clean after a save. Ask the codec instead — would the file be different?
  //
  // Seeded from what is on disk, and re-seeded when a different document opens
  // (this component stays mounted across that switch — only the editor below it
  // is keyed).
  const codec = codecFor(field);
  const lastSerialized = useRef('');
  const seededFor = useRef<string | null>(null);
  if (seededFor.current !== formId) {
    seededFor.current = formId;
    lastSerialized.current = codec.serialize(value ?? EMPTY_RICH_TEXT, field);
  }
  const setBody = useCallback(
    (next: RichTextValue) => {
      const serialized = codec.serialize(next, field);
      if (serialized === lastSerialized.current) return;
      lastSerialized.current = serialized;
      setValue(next);
    },
    [setValue, field, codec]
  );

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
      {/* min-w-0: FieldWrapper lays its children out in a grid, so this is a grid
          item and defaults to `min-width: auto` — it would refuse to shrink below
          the editor's intrinsic width and spill out of the sidebar (an indented
          list is enough to trigger it). Zeroing it lets the track win, and the
          editor's own overflow handling takes it from there. */}
      <div ref={containerRef} className='min-w-0'>
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
            input={{ value: value ?? EMPTY_RICH_TEXT, onChange: setBody }}
            field={field}
            ariaLabel={address}
          />
        </EditorContext.Provider>
      </div>
    </FieldWrapper>
  );
}
