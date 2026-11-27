import { type ReferenceTarget, targetOf } from '../core/form/references';
import { fieldsOf, fieldsetOf, scalarItemOf } from '../core/schema/children';
import type { CollectionSchema, FieldSchema } from '../core/schema/types';

export interface DocumentRef {
  collection: string;
  path: string;
}

/** The document the form shows on top of `from`, which the trail steps back to. */
export interface ReferenceStep {
  from: DocumentRef;
  /** The address of the reference field in `from`, when the page draws the target there. */
  prefix?: string;
}

// The longest collection path that prefixes the document owns it.
export const collectionOfPath = (
  path: string,
  collections: readonly CollectionSchema[]
): CollectionSchema | undefined => {
  if (path.split('/').includes('..')) return undefined;
  let owner: CollectionSchema | undefined;
  for (const collection of collections) {
    if (collection.path == null || !path.startsWith(`${collection.path}/`)) {
      continue;
    }
    if (!owner || collection.path.length > (owner.path?.length ?? 0)) {
      owner = collection;
    }
  }
  return owner;
};

export interface Crossing {
  prefix: string;
  target: ReferenceTarget;
  rest: string;
}

/** The first reference field on the way to `address` whose value names a document. */
export const findCrossing = (
  address: string,
  fields: readonly FieldSchema[],
  valueAt: (address: string) => unknown,
  collections: CollectionSchema[]
): Crossing | null => {
  const segments = address.split('.');
  let siblings: readonly FieldSchema[] | undefined = fields;
  let node: FieldSchema | undefined;
  let path = '';
  for (const [index, segment] of segments.entries()) {
    path = path ? `${path}.${segment}` : segment;
    const more = index < segments.length - 1;
    if (/^\d+$/.test(segment)) {
      const item = valueAt(path);
      const scalar = node ? scalarItemOf(node) : undefined;
      if (scalar) {
        const target = more ? targetOf(scalar, item, collections) : null;
        if (target) {
          return {
            prefix: path,
            target,
            rest: segments.slice(index + 1).join('.'),
          };
        }
        siblings = undefined;
        continue;
      }
      siblings = node ? fieldsetOf(node, item) : undefined;
      continue;
    }
    node = siblings?.find((field) => field.name === segment);
    if (!node) return null;
    const target = more ? targetOf(node, valueAt(path), collections) : null;
    if (target) {
      return {
        prefix: path,
        target,
        rest: segments.slice(index + 1).join('.'),
      };
    }
    siblings = fieldsOf(node);
  }
  return null;
};

export type Placement =
  | { kind: 'set' }
  | { kind: 'open'; target: DocumentRef; step: ReferenceStep | null };

/**
 * Where a click on the page lands. `target` is the document that holds the
 * field, `clicked` the document the page drew it from, `crossing` the reference
 * the click went through, `open` the document the form shows, `base` the
 * document a reference step leads back to (else `open`).
 */
export const decidePlacement = ({
  target,
  clicked,
  crossing,
  open,
  base,
  main,
}: {
  target: DocumentRef;
  clicked: DocumentRef;
  crossing: Crossing | null;
  open: DocumentRef | null;
  base: DocumentRef | null;
  main: string | null;
}): Placement => {
  if (open && target.path === open.path) return { kind: 'set' };
  if (base && target.path === base.path) {
    return { kind: 'open', target: base, step: null };
  }
  const fromClicked: ReferenceStep | null = crossing
    ? { from: clicked, prefix: crossing.prefix }
    : null;
  if (!base || (clicked.path === main && clicked.path !== base.path)) {
    return { kind: 'open', target, step: crossing ? fromClicked : null };
  }
  return {
    kind: 'open',
    target,
    step: {
      from: base,
      ...(clicked.path === base.path &&
        crossing && { prefix: crossing.prefix }),
    },
  };
};
