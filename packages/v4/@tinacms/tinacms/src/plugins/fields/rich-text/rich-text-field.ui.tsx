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

  const documentPath = useDocumentPath();

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

  useFieldActivation(() => {
    setTimeout(() => editable()?.focus(), 0);
  });

  return (
    <FieldWrapper errors={errors}>
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
            ariaLabelledBy={`${address}-label`}
          />
        </EditorContext.Provider>
      </div>
    </FieldWrapper>
  );
}
