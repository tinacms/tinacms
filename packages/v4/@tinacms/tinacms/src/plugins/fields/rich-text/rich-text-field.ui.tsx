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

// The raw mode is not ported. v4 has no raw markdown editor to change to, so the
// controls that would call this are hidden. Those controls are in
// fixed-toolbar-buttons.tsx, and in the card for invalid markdown. This mode needs a raw
// editor, and not this setter alone, so the context still carries the shape.
const RAW_MODE_UNAVAILABLE = false;
const setRawModeUnavailable = () => {};

export function RichTextField() {
  const address = useFieldAddress();
  const seedKey = useFormSeedKey();
  const field = useFieldSchema<RichTextFieldSchema>();
  const [value, setValue] = useFieldValue<RichTextValue>(address);
  const errors = useFieldErrors(address);
  const containerRef = useRef<HTMLDivElement>(null);

  // The editor reports the embed that the author selected. The host turns that into
  // the one active field of the store, so this code sits here and not in the editor
  // package.
  const { setActive } = useActiveField();
  const activateEmbed = useCallback(
    (embedAddress: string) => setActive(toFieldAddress(embedAddress)),
    [setActive]
  );

  // Plate fires onChange for a change of selection, and not for an edit alone. Its
  // normalization also changes the document: NodeIdPlugin adds an `id` to every node,
  // and TrailingBlockPlugin adds an empty paragraph. The mounted document therefore
  // never matches the structure of the document on disk. A compare of the two
  // documents would report an edit after a click. Ask the codec instead: would the file
  // be different? The store asks the same question of the same codec, through
  // `isEqual` on the descriptor, so this keeps a write out of RHF and the store keeps
  // it out of the dirty state.
  //
  // The value comes from the disk, and it is seeded again when another document opens.
  // This component stays mounted across that change, and only the editor below it has
  // a key.
  // The same context the ingest and the save build, so all three resolve one codec.
  // Without the path, a .md body would be compared as MDX here and written as markdown
  // by useFormSave.
  const documentPath = useDocumentPath();

  // The value the editor last reported, which is what the next change is compared
  // against. A tree, and not its source: writesSameSource caches the source of a tree
  // against the tree itself, so the comparison costs one serialize per change rather
  // than two, and a body the parser cannot write again reads as a change instead of
  // taking the field down.
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

  // Plate gives no ref for its contenteditable element, so the activation searches
  // for it. Slate mounts one tick after this component, so the search waits.
  useFieldActivation(() => {
    setTimeout(() => editable()?.focus(), 0);
  });

  return (
    <FieldWrapper errors={errors}>
      {/* Plate owns its state once it mounts, and it reads `value` as a seed only.
          A new seed must therefore remount it. The provider resets react-hook-form
          in place, and does not remount it, so the seed key changes for every one of
          those resets: another document, a discarded edit, or content that changed
          under the form. Without this key, the editor would keep the body it mounted
          with, and save that back. */}
      {/* The min-w-0 class is necessary. FieldWrapper lays its children out in a
          grid, so this element is a grid item and defaults to `min-width: auto`. It
          would then refuse to become narrower than the editor, and would spill out
          of the sidebar. An indented list is enough to cause that. A width of zero
          lets the grid track decide, and the editor then handles its own overflow. */}
      <div ref={containerRef} className='min-w-0'>
        <EditorContext.Provider
          key={seedKey}
          value={{
            fieldName: address,
            templates: field.templates ?? [],
            rawMode: RAW_MODE_UNAVAILABLE,
            setRawMode: setRawModeUnavailable,
            // The editor reports the embed that was selected. The host decides what
            // that means, which is why the editor package no longer imports the form
            // store. Refer to activateEmbed above.
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
