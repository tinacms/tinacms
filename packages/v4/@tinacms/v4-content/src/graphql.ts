import { buildDotTinaFiles } from '@tinacms/graphql';
import type { DocumentNode } from 'graphql';
import type { TinaLock } from './lock';
import {
  ARRAY_FIELD_TYPE,
  type CollectionSchema,
  collectionFormats,
  type FieldSchema,
  fieldsOf,
  hasValidator,
  scalarItemOf,
  type TemplateSchema,
} from './schema';

export interface V3Field {
  type: string;
  name: string;
  label?: string;
  required: boolean;
  list?: boolean;
  isBody?: boolean;
  fields?: V3Field[];
  templates?: Array<Omit<TemplateSchema, 'fields'> & { fields: V3Field[] }>;
  collections?: string[];
}

export interface V3Collection {
  name: string;
  label?: string;
  path?: string;
  format: string;
  fields: V3Field[];
}

/** A collection that the v3 engine cannot serve, and the reason. */
export interface SkippedCollection {
  collection: string;
  reason: string;
}

export interface LockGraphQL {
  /** The v3 `TinaSchema` instance. The database indexes against it. */
  tinaSchema: unknown;
  graphQLSchema: DocumentNode;
  lookup: Record<string, unknown>;
  /** Collections left out of the schema. Their documents are not queryable. */
  skipped: SkippedCollection[];
  /** Served collections whose secondary formats GraphQL does not index. */
  warnings: string[];
}

// v3 has no `array` type. A v3 list is its item type with `list: true`. So an
// array of objects or templates becomes a list `object`, and an `of` array
// becomes a list of its scalar type. This bridge is the one place outside the
// array plugin that names the array type.
export const toV3Field = (field: FieldSchema): V3Field => {
  const required = hasValidator(field, 'required');
  const of = scalarItemOf(field);
  if (of) {
    return {
      ...toV3Field(of),
      name: field.name,
      label: field.label,
      required,
      list: true,
    };
  }
  const fields = fieldsOf(field);
  const isArray = field.type === ARRAY_FIELD_TYPE;
  return {
    type: isArray ? 'object' : field.type,
    name: field.name,
    label: field.label,
    required,
    isBody: field.isBody,
    ...(isArray ? { list: true } : {}),
    ...(fields ? { fields: fields.map(toV3Field) } : {}),
    ...(field.templates
      ? {
          templates: field.templates.map((template) => ({
            ...template,
            fields: template.fields.map(toV3Field),
          })),
        }
      : {}),
    ...(field.collections ? { collections: field.collections } : {}),
  };
};

export const toV3Collection = (collection: CollectionSchema): V3Collection => ({
  name: collection.name,
  label: collection.label,
  path: collection.path,
  format: collectionFormats(collection.format)[0],
  fields: collection.fields.map(toV3Field),
});

// The field types that the v3 GraphQL builder serves, after `toV3Field`.
const V3_FIELD_TYPES: ReadonlySet<string> = new Set([
  'string',
  'number',
  'boolean',
  'datetime',
  'image',
  'object',
  'reference',
  'rich-text',
]);

const childrenOf = (field: V3Field): V3Field[] => [
  ...(field.fields ?? []),
  ...(field.templates ?? []).flatMap((template) => template.fields),
];

const fieldsIn = (fields: V3Field[]): V3Field[] =>
  fields.flatMap((field) => [field, ...fieldsIn(childrenOf(field))]);

const unservedTypeIn = (collection: V3Collection): string | undefined =>
  fieldsIn(collection.fields).find((field) => !V3_FIELD_TYPES.has(field.type))
    ?.type;

const skippedTargetOf = (
  collection: V3Collection,
  skipped: ReadonlySet<string>
): string | undefined =>
  fieldsIn(collection.fields)
    .flatMap((field) => field.collections ?? [])
    .find((target) => skipped.has(target));

// A collection is skipped when it holds a field type v3 cannot serve, or when it
// references a skipped collection: v3 cannot build a reference to a missing type.
const partition = (
  collections: V3Collection[]
): { served: V3Collection[]; skipped: SkippedCollection[] } => {
  const skipped: SkippedCollection[] = [];
  for (const collection of collections) {
    const type = unservedTypeIn(collection);
    if (type !== undefined) {
      skipped.push({
        collection: collection.name,
        reason: `The field type "${type}" has no GraphQL type in the v3 engine.`,
      });
    }
  }
  const names = new Set(skipped.map(({ collection }) => collection));
  let served = collections.filter(({ name }) => !names.has(name));
  for (;;) {
    const referrers = served.flatMap((collection) => {
      const target = skippedTargetOf(collection, names);
      return target === undefined ? [] : [{ collection, target }];
    });
    if (referrers.length === 0) return { served, skipped };
    for (const { collection, target } of referrers) {
      names.add(collection.name);
      skipped.push({
        collection: collection.name,
        reason: `It references the collection "${target}", which is skipped.`,
      });
    }
    served = served.filter(({ name }) => !names.has(name));
  }
};

const unindexedFormatWarnings = (collections: CollectionSchema[]): string[] =>
  collections.flatMap((collection) => {
    const [primary, ...rest] = collectionFormats(collection.format);
    if (rest.length === 0) return [];
    return [
      `Collection "${collection.name}" declares formats ${[primary, ...rest].join(', ')}, but GraphQL indexes "${primary}" only — ${rest.join(', ')} documents are editable but will not appear in query results.`,
    ];
  });

/**
 * Builds the v3 GraphQL schema for the collections of a lock. It does not read
 * content. A collection that the v3 engine cannot serve goes into `skipped`.
 */
export const lockToGraphQL = async (
  lock: Pick<TinaLock, 'schema'>
): Promise<LockGraphQL> => {
  const { collections } = lock.schema;
  const { served, skipped } = partition(collections.map(toV3Collection));
  // A skipped collection is reported in `skipped`, so no format warning for it.
  const skippedNames = new Set(skipped.map(({ collection }) => collection));
  const { graphQLSchema, tinaSchema, lookup } = await buildDotTinaFiles({
    config: { schema: { collections: served } },
    buildSDK: false,
  });
  return {
    tinaSchema,
    graphQLSchema,
    lookup,
    skipped,
    warnings: unindexedFormatWarnings(
      collections.filter(({ name }) => !skippedNames.has(name))
    ),
  };
};
