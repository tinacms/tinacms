import { useRef } from 'react';
import {
  useFieldActivation,
  useFieldAddress,
  useFieldFrame,
  useFieldValue,
} from '../../../editor';
import { DatetimeFieldView } from './datetime-field.view';

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
const toInputValue = (stored: string | null): string => {
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
  stored: string | null
): string | null => {
  if (wallClock === '') return null;
  if (stored != null && !CARRIES_A_ZONE.test(stored)) return wallClock;
  const instant = new Date(wallClock);
  if (Number.isNaN(instant.getTime())) return wallClock;
  return instant.toISOString();
};

export function DatetimeField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string | null>(address);
  const frame = useFieldFrame();
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus());

  return (
    <DatetimeFieldView
      {...frame}
      ref={inputRef}
      id={address}
      value={toInputValue(value)}
      onChange={(wallClock) => setValue(fromInputValue(wallClock, value))}
    />
  );
}
