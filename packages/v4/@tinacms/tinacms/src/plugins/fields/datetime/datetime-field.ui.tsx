import { FieldWrapper } from '@tinacms/ui/components/field-wrapper';
import { Input } from '@tinacms/ui/components/input';
import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldErrors,
  useFieldValue,
} from '../../../editor';

const CARRIES_A_ZONE = /(?:Z|[+-]\d{2}:\d{2})$/;

const pad = (value: number, width = 2): string =>
  String(value).padStart(width, '0');

const toLocalWallClock = (instant: Date): string =>
  `${pad(instant.getFullYear(), 4)}-${pad(instant.getMonth() + 1)}-${pad(
    instant.getDate()
  )}T${pad(instant.getHours())}:${pad(instant.getMinutes())}`;

/**
 * `datetime-local` has no zone. A stored value that carries a zone is an
 * instant, so the input shows the local wall clock of that instant. A stored
 * value with no zone already spells a wall clock, so it passes through.
 */
const toInputValue = (stored: string | undefined): string => {
  if (!stored) return '';
  if (!stored.includes('T')) return `${stored}T00:00`;
  if (!CARRIES_A_ZONE.test(stored)) return stored.slice(0, 16);
  const instant = new Date(stored);
  if (Number.isNaN(instant.getTime())) return '';
  return toLocalWallClock(instant);
};

/**
 * The field keeps the zone of the stored value. A value that carries a zone
 * goes back as UTC, so a touch cannot move the instant. A value with no zone
 * stays without one — the field does not give a zone to a value that another
 * writer made. A new value gets UTC.
 */
const fromInputValue = (
  wallClock: string,
  stored: string | undefined
): string | undefined => {
  if (wallClock === '') return undefined;
  if (stored !== undefined && !CARRIES_A_ZONE.test(stored)) return wallClock;
  const instant = new Date(wallClock);
  if (Number.isNaN(instant.getTime())) return wallClock;
  return instant.toISOString();
};

export function DatetimeField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string | undefined>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <FieldWrapper errors={errors}>
      <Input
        ref={inputRef}
        type='datetime-local'
        id={address}
        value={toInputValue(value)}
        onChange={(event) =>
          setValue(fromInputValue(event.target.value, value))
        }
      />
    </FieldWrapper>
  );
}
