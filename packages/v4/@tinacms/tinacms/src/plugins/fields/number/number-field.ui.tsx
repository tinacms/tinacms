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
  // The stored value is a number, but the editor value is the raw input string
  // (`undefined` when empty) so partial entries like `-` or `1.` survive typing.
  const [value, setValue] = useFieldValue<string | undefined>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  // TODO(shadcn): swap this raw input/markup for shared, themed primitives from
  // src/ui/ (shadcn — Input/Label/form-field wrapper, added via the shadcn CLI) so
  // every field looks consistent and is re-themeable without per-field redesign.
  return (
    <div>
      <input
        ref={inputRef}
        type='number'
        // Default to 'any' so decimals aren't flagged as a stepMismatch.
        step={field.step ?? 'any'}
        aria-label={address}
        value={value ?? ''}
        // Browser `badInput` (e.g. "5e") reports '' here, so it collapses to empty;
        // surfacing it needs the value model / save flow, deferred for now.
        onChange={(event) =>
          setValue(event.target.value === '' ? undefined : event.target.value)
        }
        // Stop a scroll over a focused input from silently changing the value.
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
