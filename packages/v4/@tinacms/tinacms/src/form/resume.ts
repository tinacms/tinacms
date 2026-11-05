import type { FieldAddress } from '../core/field/address';
import type { FieldEquality } from '../core/form/compare';
import type { FormValues } from './form-store';

/** A waiting copy as the form sees it: values and the file values it was typed on. */
export interface WaitingCopy {
  readonly values: FormValues;
  readonly baseline: FormValues;
  readonly leftover?: boolean;
}

export interface ResumeResult {
  readonly values: FormValues;
  /** Values that lost, each kept as a copy that holds only those fields. */
  readonly leftovers: WaitingCopy[];
}

const addressesOf = (...sets: FormValues[]) =>
  [...new Set(sets.flatMap((set) => Object.keys(set)))] as FieldAddress[];

const changed = (
  equal: FieldEquality,
  now: FormValues,
  before: FormValues
): FieldAddress[] =>
  addressesOf(now, before).filter(
    (address) => !equal(address, now[address], before[address])
  );

const leftoverOf = (
  document: FormValues,
  lost: Record<string, unknown>
): WaitingCopy[] =>
  Object.keys(lost).length === 0
    ? []
    : [
        {
          values: { ...document, ...lost } as FormValues,
          baseline: document,
          leftover: true,
        },
      ];

/**
 * What Resume puts in the form. Highest precedence first: what the form holds now
 * (typed since opening), the newest waiting copy, older copies, then the file.
 * Every value that loses and differs from the winner stays in a leftover copy.
 * When only leftover copies wait, Resume swaps them with what the form holds.
 */
export function resumeWaiting({
  document,
  current,
  copies,
  equal,
}: {
  document: FormValues;
  current: FormValues;
  copies: readonly WaitingCopy[];
  equal: FieldEquality;
}): ResumeResult {
  const swap = copies.length > 0 && copies.every((copy) => copy.leftover);
  if (swap) {
    const values = { ...current };
    const displaced: Record<string, unknown> = {};
    for (const copy of copies) {
      for (const address of changed(equal, copy.values, copy.baseline)) {
        if (equal(address, current[address], copy.values[address])) continue;
        displaced[address] = current[address];
        values[address] = copy.values[address];
      }
    }
    return { values, leftovers: leftoverOf(document, displaced) };
  }
  const values = { ...document };
  for (const copy of copies) {
    for (const address of changed(equal, copy.values, copy.baseline)) {
      values[address] = copy.values[address];
    }
  }
  for (const address of changed(equal, current, document)) {
    values[address] = current[address];
  }
  const leftovers = copies.flatMap((copy) => {
    const lost: Record<string, unknown> = {};
    for (const address of changed(equal, copy.values, copy.baseline)) {
      if (!equal(address, copy.values[address], values[address])) {
        lost[address] = copy.values[address];
      }
    }
    return leftoverOf(document, lost);
  });
  return { values, leftovers };
}

/** The top-level fields a copy changed against its own baseline. */
export const changedFields = (
  copy: WaitingCopy,
  equal: FieldEquality
): FieldAddress[] => changed(equal, copy.values, copy.baseline);
