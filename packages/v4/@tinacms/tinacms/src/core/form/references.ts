import type {
  CollectionSchema,
  FieldSchema,
  TinaDocument,
} from '../schema/types';

const REFERENCE_FIELD_TYPE = 'reference';

export interface ReferenceTarget {
  collection: string;
  path: string;
}

const isDocument = (value: unknown): value is TinaDocument =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const childFieldsOf = (node: FieldSchema): FieldSchema[] | undefined => {
  const { fields } = node as { fields?: FieldSchema[] };
  return Array.isArray(fields) ? fields : undefined;
};

// A reference stores the path of the document it points at. `collections`
// narrows the candidates, and the one whose `path` contains that document owns
// it — `content.get` needs a collection name, not a path.
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

export const collectReferences = (
  values: TinaDocument | undefined,
  fields: FieldSchema[],
  collections: CollectionSchema[]
): ReferenceTarget[] => {
  const targets: ReferenceTarget[] = [];
  const walk = (document: TinaDocument, nodes: FieldSchema[]): void => {
    for (const node of nodes) {
      const value = document[node.name];
      if (node.type === REFERENCE_FIELD_TYPE) {
        const target = targetOf(node, value, collections);
        if (target) targets.push(target);
        continue;
      }
      const children = childFieldsOf(node);
      if (!children) continue;
      if (Array.isArray(value)) {
        for (const item of value) if (isDocument(item)) walk(item, children);
      } else if (isDocument(value)) {
        walk(value, children);
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
// document it points at. An unresolved target keeps its path, so the site sees
// the same value it would for a reference that no longer exists.
export const resolveReferences = (
  values: TinaDocument | undefined,
  fields: FieldSchema[],
  collections: CollectionSchema[],
  resolve: ReferenceResolver
): TinaDocument => {
  const walk = (document: TinaDocument, nodes: FieldSchema[]): TinaDocument => {
    const resolved: TinaDocument = { ...document };
    for (const node of nodes) {
      const value = document[node.name];
      if (node.type === REFERENCE_FIELD_TYPE) {
        const target = targetOf(node, value, collections);
        const referenced = target ? resolve(target) : undefined;
        if (referenced) resolved[node.name] = referenced;
        continue;
      }
      const children = childFieldsOf(node);
      if (!children) continue;
      if (Array.isArray(value)) {
        resolved[node.name] = value.map((item) =>
          isDocument(item) ? walk(item, children) : item
        );
      } else if (isDocument(value)) {
        resolved[node.name] = walk(value, children);
      }
    }
    return resolved;
  };
  return walk(values ?? {}, fields);
};
