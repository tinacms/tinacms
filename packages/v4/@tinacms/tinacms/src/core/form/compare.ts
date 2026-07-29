import { type FieldAddress, toFieldAddress } from '../field/address';
import type { FieldTransformContext } from '../field/contract';
import type { FieldRegistry } from '../field/registry';
import type { FieldSchema } from '../schema/types';

// Whether a form still holds the value it started with. The form store asks this to tell
// a real edit from a value that only looks new (ADR-010).
//
// Most values are their own answer. A string field holds the string that the document
// holds, so a compare of the two values is exact. A field whose editor value is richer
// than its stored form is not: Plate rewrites the rich-text tree as it mounts, with an id
// on every node and a trailing block, so the tree in the editor never matches the tree
// parsed from the file. Compared as structure, a body that its author has typed and then
// deleted again reports an edit for ever, and the badge never leaves "Unsaved". Such a
// field answers for itself, through isEqual on its descriptor.

// The RHF subscription sends a clone of each value, but markSaved keeps the original as
// the baseline. A reference test therefore holds a structural value, such as the
// rich-text tree, dirty for ever. The values are JSON documents, so this compares their
// structure. A wrong result costs one more dirty read. It never loses an edit.
export const sameValue = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;
  return JSON.stringify(a) === JSON.stringify(b);
};

// The equality of one open form, address by address. The form store holds one of these
// per form, so the store itself needs no field registry.
export type FieldEquality = (
  address: FieldAddress,
  a: unknown,
  b: unknown
) => boolean;

// The answer for a form whose fields all hold their own stored value. It is also the
// answer for a caller with no registry, such as a test.
export const STRUCTURAL_EQUALITY: FieldEquality = (_address, a, b) =>
  sameValue(a, b);

// The equality of a form, built from the descriptors of its fields. Each isEqual is bound
// to its own schema node and to the document, because a field resolves its transforms
// from both. The rich-text field selects its codec in that way.
export const fieldEqualityFor = (
  fields: FieldSchema[],
  registry: FieldRegistry,
  context: FieldTransformContext = {}
): FieldEquality => {
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
  // The structural test runs first. It answers every untouched field by reference, so
  // the field that is being edited is the only one that pays for its own compare.
  return (address, a, b) =>
    sameValue(a, b) || (declared.get(address)?.(a, b) ?? false);
};
