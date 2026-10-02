import { defineClientPlugin } from '../../client';
import type {
  FieldValidationContext,
  Validate,
  ValidatorFactory,
} from '../../core/field/contract';
import type { JsonValue } from '../../core/json';
import type { FieldSchema } from '../../core/schema/types';
import { max, min, pattern, required } from '../../plugins/fields';

const labelOf = (node: FieldSchema): string => node.label ?? node.name;

const amountIn = (
  value: unknown,
  context: FieldValidationContext
): { amount: number; noun: string } | null => {
  const measure = context.measure(value);
  if (!measure) return null;
  return {
    amount: measure.amount,
    noun: measure.unit ? ` ${measure.unit}` : '',
  };
};

const requiredFactory: ValidatorFactory = (
  message?: JsonValue
): Validate<unknown, FieldValidationContext> =>
  function required(value, context) {
    if (!context.isEmpty(value)) return null;
    return String(message ?? `${labelOf(context.node)} is required`);
  };

const minFactory: ValidatorFactory = (
  limit: JsonValue,
  message?: JsonValue
): Validate<unknown, FieldValidationContext> =>
  function min(value, context) {
    if (context.isEmpty(value)) return null;
    const measured = amountIn(value, context);
    if (!measured || measured.amount >= Number(limit)) return null;
    return String(
      message ??
        `${labelOf(context.node)} must be at least ${limit}${measured.noun}`
    );
  };

const maxFactory: ValidatorFactory = (
  limit: JsonValue,
  message?: JsonValue
): Validate<unknown, FieldValidationContext> =>
  function max(value, context) {
    if (context.isEmpty(value)) return null;
    const measured = amountIn(value, context);
    if (!measured || measured.amount <= Number(limit)) return null;
    return String(
      message ??
        `${labelOf(context.node)} must be at most ${limit}${measured.noun}`
    );
  };

const compileRegExp = (source: string): RegExp | null => {
  try {
    return new RegExp(source);
  } catch {
    return null;
  }
};

const patternFactory: ValidatorFactory = (
  source: JsonValue,
  message?: JsonValue
): Validate<unknown, FieldValidationContext> =>
  function pattern(value, context) {
    if (typeof value !== 'string' || value === '') return null;
    const compiled = compileRegExp(String(source));
    if (!compiled || compiled.test(value)) return null;
    return String(message ?? `${labelOf(context.node)} is invalid`);
  };

export default defineClientPlugin({
  validators: {
    required: requiredFactory,
    min: minFactory,
    max: maxFactory,
    pattern: patternFactory,
  },
});
