import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from '../../../editor';

export function StringField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string>(address);
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
        aria-label={address}
        value={value ?? ''}
        onChange={(event) => setValue(event.target.value)}
      />
      {errors.map((error) => (
        <span key={error} role='alert'>
          {error}
        </span>
      ))}
    </div>
  );
}
