import { type NestedValue, nestedValuesOf } from '../schema/children';
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
      for (const nested of nestedValuesOf(node, value)) {
        if ('field' in nested) {
          const itemTarget = targetOf(nested.field, nested.value, collections);
          if (itemTarget) targets.push(itemTarget);
        } else if (isDocument(nested.value)) {
          walk(nested.value, nested.fields);
        }
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
  const resolveNested = (nested: NestedValue): unknown => {
    if ('field' in nested) {
      const target = targetOf(nested.field, nested.value, collections);
      return (target ? resolve(target) : undefined) ?? nested.value;
    }
    return isDocument(nested.value)
      ? walk(nested.value, nested.fields)
      : nested.value;
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
      const nestedValues = nestedValuesOf(node, value);
      if (Array.isArray(value)) {
        const items = [...value];
        for (const nested of nestedValues) {
          if (nested.index !== undefined)
            items[nested.index] = resolveNested(nested);
        }
        resolved[node.name] = items;
      } else if (nestedValues[0]) {
        resolved[node.name] = resolveNested(nestedValues[0]);
      }
    }
    return resolved;
  };
  return walk(values ?? {}, fields);
};
