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
  const [value, setValue] = useFieldValue<string | undefined>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  // TODO(shadcn): replace with the shared components in src/ui/.
  return (
    <div>
      <input
        ref={inputRef}
        type='number'
        step={field.step ?? 'any'}
        id={address}
        aria-label={address}
        value={value ?? ''}
        onChange={(event) =>
          setValue(event.target.value === '' ? undefined : event.target.value)
        }
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
