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
import { RichEditor } from './plate';
import { EditorContext } from './plate/editor-context';
import { astToMarkdown } from './rich-text-field.markdown';
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

  // Plate fires onChange for selection changes too, not just edits, and its
  // normalization (NodeIdPlugin stamps an `id` on every node, TrailingBlockPlugin
  // appends an empty paragraph) means the mounted AST never structurally matches
  // the one parsed off disk. Comparing ASTs would therefore report an edit on a
  // mere click; the form store compares by reference (form-store.ts
  // `valuesEqual`), so that edit would stick and the document could never return
  // to clean after a save. Compare what the user actually means by unsaved
  // changes: would the file be different?
  // Seeded from the value on disk, and re-seeded when a different document opens
  // (this component stays mounted across that switch — only the editor below it
  // is keyed).
  const lastMarkdown = useRef('');
  const seededFor = useRef<string | null>(null);
  if (seededFor.current !== formId) {
    seededFor.current = formId;
    lastMarkdown.current = astToMarkdown(value ?? EMPTY_AST, field);
  }
  const setBody = useCallback(
    (next: RichTextAst) => {
      const markdown = astToMarkdown(next, field);
      if (markdown === lastMarkdown.current) return;
      lastMarkdown.current = markdown;
      setValue(next);
    },
    [setValue, field]
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
            input={{ value: value ?? EMPTY_AST, onChange: setBody }}
            field={field}
            ariaLabel={address}
          />
        </EditorContext.Provider>
      </div>
    </FieldWrapper>
  );
}
