import { EMPTY_RICH_TEXT, type RichTextValue } from '@tinacms/rich-text';
import { EditorContext, RichEditor } from '@tinacms/rich-text/editor';
import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { useCallback, useRef } from 'react';
import { toFieldAddress } from '../../../core/field/address';
import {
  useActiveField,
  useDocumentPath,
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldSchema,
  useFieldValue,
  useFormSeedKey,
} from '../../../editor';
import { writesSameSource } from './rich-text-codecs';
import type { RichTextFieldSchema } from './rich-text-field.schema';

// Raw mode is not ported: v4 has no raw markdown editor yet, so the controls
// are hidden but the context still carries the shape.
const RAW_MODE_UNAVAILABLE = false;
const setRawModeUnavailable = () => {};

export function RichTextField() {
  const address = useFieldAddress();
  const seedKey = useFormSeedKey();
  const field = useFieldSchema<RichTextFieldSchema>();
  const [value, setValue] = useFieldValue<RichTextValue>(address);
  const errors = useFieldErrors(address);
  const containerRef = useRef<HTMLDivElement>(null);

  const { setActive } = useActiveField();
  const activateEmbed = useCallback(
    (embedAddress: string) => setActive(toFieldAddress(embedAddress)),
    [setActive]
  );

  // Same context the ingest and the save build, so all three resolve one codec:
  // without the path, a .md body would be compared as MDX here and written as
  // markdown by useFormSave.
  const documentPath = useDocumentPath();

  // Plate fires onChange on selection changes and its normalization rewrites the
  // tree, so compare written source against the last reported value instead of
  // trees — a click must not read as an edit.
  const lastValue = useRef<RichTextValue>(EMPTY_RICH_TEXT);
  const seededFor = useRef<string | null>(null);
  if (seededFor.current !== seedKey) {
    seededFor.current = seedKey;
    lastValue.current = value ?? EMPTY_RICH_TEXT;
  }
  const setBody = useCallback(
    (next: RichTextValue) => {
      if (writesSameSource(next, lastValue.current, field, { documentPath })) {
        return;
      }
      lastValue.current = next;
      setValue(next);
    },
    [setValue, field, documentPath]
  );

  const editable = () =>
    containerRef.current?.querySelector<HTMLElement>('[role="textbox"]');

  // Plate gives no ref for its contenteditable, and Slate mounts one tick after
  // this component, so the search waits.
  useFieldActivation(() => {
    setTimeout(() => editable()?.focus(), 0);
  });

  return (
    <FieldWrapper errors={errors}>
      {/* Plate reads `value` as a seed only, so a new seed must remount it via
          the key. min-w-0: as a grid item this defaults to min-width:auto and
          would spill out of the sidebar instead of shrinking. */}
      <div ref={containerRef} className='min-w-0'>
        <EditorContext.Provider
          key={seedKey}
          value={{
            fieldName: address,
            templates: field.templates ?? [],
            rawMode: RAW_MODE_UNAVAILABLE,
            setRawMode: setRawModeUnavailable,
            onActivateField: activateEmbed,
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
