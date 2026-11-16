import type { ValidatorRef } from '../../../core/schema/types';
import { toNumber } from './number-field.schema';

export type StepDirection = 'up' | 'down';

export interface StepLimits {
  min?: number;
  max?: number;
}

/** The limit a `min` or `max` validator sets: the first ref whose first arg is a finite number. */
export const limitOf = (
  node: { validators?: ValidatorRef[] },
  name: 'min' | 'max'
): number | undefined => {
  for (const ref of node.validators ?? []) {
    const limit = ref.args?.[0];
    if (
      ref.name === name &&
      typeof limit === 'number' &&
      Number.isFinite(limit)
    )
      return limit;
  }
  return undefined;
};

export const effectiveStep = (step: number | undefined): number =>
  step !== undefined && Number.isFinite(step) && step > 0 ? step : 1;

const parsed = (raw: string | null | undefined): number | undefined => {
  const n = toNumber(raw);
  return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
};

const decimalsOf = (n: number): number => {
  const [mantissa = '', exponent = '0'] = String(n).split('e');
  const fraction = mantissa.split('.')[1]?.length ?? 0;
  return Math.max(0, fraction - Number(exponent));
};

const clamp = (n: number, { min, max }: StepLimits): number => {
  const atLeast = min === undefined ? n : Math.max(n, min);
  return max === undefined ? atLeast : Math.min(atLeast, max);
};

/** Whether a step button is at its limit. An empty or unparseable box is never at one. */
export const atLimit = (
  raw: string | null | undefined,
  direction: StepDirection,
  { min, max }: StepLimits
): boolean => {
  const n = parsed(raw);
  if (n === undefined) return false;
  return direction === 'up'
    ? max !== undefined && n >= max
    : min !== undefined && n <= min;
};

/** The text a step button or arrow key writes, or `null` when the step changes nothing. */
export const stepValue = (
  raw: string | null | undefined,
  direction: StepDirection,
  step: number | undefined,
  limits: StepLimits
): string | null => {
  if (atLimit(raw, direction, limits)) return null;
  const s = effectiveStep(step);
  const n = parsed(raw);
  const sign = direction === 'up' ? 1 : -1;
  let next: number;
  if (n === undefined) {
    next = direction === 'up' ? (limits.min ?? s) : (limits.max ?? -s);
  } else {
    const places = Math.max(decimalsOf(n), decimalsOf(s));
    next = Number((n + sign * s).toFixed(Math.min(places, 100)));
  }
  const result = clamp(next, limits);
  return String(Object.is(result, -0) ? 0 : result);
};
