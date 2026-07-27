import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Textarea } from '@tinacms/ui/components/textarea';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from '../../../editor';

export function RichTextField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string>(address);
  const errors = useFieldErrors(address);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useFieldActivation(() => textareaRef.current?.focus());

  return (
    <FieldWrapper errors={errors}>
      <Textarea
        ref={textareaRef}
        aria-label={address}
        value={value ?? ''}
        onChange={(event) => setValue(event.target.value)}
      />
    </FieldWrapper>
  );
}
