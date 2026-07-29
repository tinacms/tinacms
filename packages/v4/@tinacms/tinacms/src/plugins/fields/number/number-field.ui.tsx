import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldSchema,
  useFieldValue,
} from '../../../editor';
import type { NumberFieldSchema } from './number-field.schema';

export function NumberField() {
  const address = useFieldAddress();
  const field = useFieldSchema<NumberFieldSchema>();
  // The stored value is a number, but the editor value is the string from the input.
  // It is undefined when the input is empty. A partial entry such as `-` or `1.`
  // therefore survives while the author types.
  const [value, setValue] = useFieldValue<string | undefined>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  // TODO(shadcn): replace this input and its markup with the shared components in
  // src/ui/. Those are the shadcn Input, Label, and form field wrapper, added with the
  // shadcn CLI. Every field then looks the same, and a new theme needs no change to a
  // field.
  return (
    <div>
      <input
        ref={inputRef}
        type='number'
        // The default is 'any', so the browser does not report a decimal as a
        // stepMismatch.
        step={field.step ?? 'any'}
        id={address}
        aria-label={address}
        value={value ?? ''}
        // The browser reports an empty string here for bad input, such as "5e", so
        // the value becomes empty. A report of that state needs the value model and
        // the save flow, which come later.
        onChange={(event) =>
          setValue(event.target.value === '' ? undefined : event.target.value)
        }
        // Stop a scroll over a focused input from changing the value.
        onWheel={(event) => event.currentTarget.blur()}
      />
      {errors.map((error) => (
        <span key={error} role='alert'>
          {error}
        </span>
      ))}
    </div>
  );
}
