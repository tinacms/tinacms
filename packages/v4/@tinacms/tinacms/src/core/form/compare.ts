import { type FieldAddress, toFieldAddress } from '../field/address';
import type { FieldTransformContext } from '../field/contract';
import type { FieldSchema } from '../schema/types';

export const sameValue = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

export type FieldEquality = (
  address: FieldAddress,
  a: unknown,
  b: unknown
) => boolean;

export const STRUCTURAL_EQUALITY: FieldEquality = (_address, a, b) =>
  sameValue(a, b);

export const fieldEqualityFor = (
  fields: FieldSchema[],
  context: FieldTransformContext
): FieldEquality => {
  const { registry } = context;
  const declared = new Map<FieldAddress, (a: unknown, b: unknown) => boolean>();
  for (const node of fields) {
    const isEqual = registry.get(node.type)?.isEqual;
    if (isEqual) {
      declared.set(toFieldAddress(node.name), (a, b) =>
        isEqual(a, b, node, context)
      );
    }
  }
  if (declared.size === 0) return STRUCTURAL_EQUALITY;
  return (address, a, b) =>
    sameValue(a, b) || (declared.get(address)?.(a, b) ?? false);
};
