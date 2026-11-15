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
  /** The waiting list after Resume: every value that did not go into the form. */
  readonly copies: WaitingCopy[];
  /** True when Resume swapped the newest leftover copy with the form. */
  readonly swapped: boolean;
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
 * When the newest copy is a leftover, Resume swaps that one copy with what the
 * form holds and leaves the older copies where they are.
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
  const newest = copies.at(-1);
  if (newest?.leftover) {
    const values = { ...current };
    const displaced: Record<string, unknown> = {};
    for (const address of changed(equal, newest.values, newest.baseline)) {
      if (equal(address, current[address], newest.values[address])) continue;
      values[address] = newest.values[address];
      if (!equal(address, current[address], document[address])) {
        displaced[address] = current[address];
      }
    }
    return {
      values,
      copies: [...copies.slice(0, -1), ...leftoverOf(document, displaced)],
      swapped: true,
    };
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
  return { values, copies: leftovers, swapped: false };
}
