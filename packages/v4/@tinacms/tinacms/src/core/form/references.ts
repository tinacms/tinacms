import { fieldsetOf, scalarItemOf } from '../schema/children';
import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../schema/types';

export interface ReferenceTarget {
  collection: string;
  path: string;
}

const isDocument = (value: unknown): value is TinaDocument =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// A reference stores the path of the document it points at, and it is the only
// node that declares `collections`. Reading that rather than the type key keeps
// core from naming a field type. `collections` narrows the candidates, and the
// one whose `path` contains that document owns it, because `content.get` needs
// a collection name and not a path.
const targetOf = (
  node: FieldSchema,
  value: unknown,
  collections: CollectionSchema[]
): ReferenceTarget | null => {
  if (typeof value !== 'string' || value.length === 0) return null;
  const candidates = node.collections;
  if (!candidates) return null;
  const owner = collections.find(
    (collection) =>
      candidates.includes(collection.name) &&
      collection.path != null &&
      value.startsWith(`${collection.path}/`)
  );
  return owner ? { collection: owner.name, path: value } : null;
};

// TODO(#7534): these walks read `fields`, `templates` and `of` by key. Fold
// them into the registry-driven path that `ingest.ts` uses.
export const collectReferences = (
  values: TinaDocument | undefined,
  fields: FieldSchema[],
  collections: CollectionSchema[]
): ReferenceTarget[] => {
  const targets: ReferenceTarget[] = [];
  const walk = (document: TinaDocument, nodes: FieldSchema[]): void => {
    for (const node of nodes) {
      const value = document[node.name];
      const target = targetOf(node, value, collections);
      if (target) {
        targets.push(target);
        continue;
      }
      const scalar = scalarItemOf(node);
      for (const item of Array.isArray(value) ? value : [value]) {
        if (scalar) {
          const itemTarget = targetOf(scalar, item, collections);
          if (itemTarget) targets.push(itemTarget);
          continue;
        }
        const children = fieldsetOf(node, item);
        if (children && isDocument(item)) walk(item, children);
      }
    }
  };
  walk(values ?? {}, fields);
  return targets;
};

export type ReferenceResolver = (
  target: ReferenceTarget
) => TinaDocument | undefined;

// The preview renders the site's own shape, where a reference reads as the
// document it points at and an unset field is absent. An unresolved target
// keeps its path, so the site sees the same value it would for a reference that
// no longer exists.
export const resolveReferences = (
  values: TinaDocument | undefined,
  fields: FieldSchema[],
  collections: CollectionSchema[],
  resolve: ReferenceResolver
): TinaDocument => {
  const resolveNested = (node: FieldSchema, item: unknown): unknown => {
    const scalar = scalarItemOf(node);
    if (scalar) {
      const target = targetOf(scalar, item, collections);
      return (target ? resolve(target) : undefined) ?? item;
    }
    const children = fieldsetOf(node, item);
    return children && isDocument(item) ? walk(item, children) : item;
  };
  const walk = (document: TinaDocument, nodes: FieldSchema[]): TinaDocument => {
    const resolved: TinaDocument = { ...document };
    for (const node of nodes) {
      const value = document[node.name];
      if (value === null) {
        delete resolved[node.name];
        continue;
      }
      const target = targetOf(node, value, collections);
      if (target) {
        const referenced = resolve(target);
        if (referenced) resolved[node.name] = referenced;
        continue;
      }
      if (Array.isArray(value)) {
        resolved[node.name] = value.map((item) => resolveNested(node, item));
      } else if (isDocument(value)) {
        resolved[node.name] = resolveNested(node, value);
      }
    }
    return resolved;
  };
  return walk(values ?? {}, fields);
};
