import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from '../../../editor';

export function BooleanField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<boolean>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  // TODO(shadcn): swap this raw checkbox/markup for shared, themed primitives from
  // src/ui/ (shadcn — Checkbox/Label/form-field wrapper, added via the shadcn CLI) so
  // every field looks consistent and is re-themeable without per-field redesign.
  return (
    <div>
      <input
        ref={inputRef}
        type='checkbox'
        aria-label={address}
        checked={value ?? false}
        onChange={(event) => setValue(event.target.checked)}
      />
      {errors.map((error) => (
        <span key={error} role='alert'>
          {error}
        </span>
      ))}
    </div>
  );
}
