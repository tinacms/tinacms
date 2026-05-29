import * as G from 'graphql';
import { describe, expect, it } from 'vitest';
import { expandQuery } from './expand-query';
import { getFormAndFieldNameFromMetadata } from './util';

/**
 * Regression coverage for click-to-edit on documents returned by connection
 * queries (e.g. `tagConnection`). The visual-editing resolver attaches
 * `_tina_metadata` to every resolved document; `field:selected` then reads it
 * back out of the resolver result to open the right form and focus the field.
 *
 * For that read-back to work, the resolver query produced by `expandQuery`
 * must actually *select* `_tina_metadata` on document-typed fields. Node-typed
 * fields only get it when `includeNodeMetadata` is passed (which
 * `graphql-reducer` does for the resolver query), so these tests assert that
 * both a single-document query and a connection query carry the metadata
 * through to the resolved result.
 */

// A minimal but faithful slice of a generated Tina schema: the Node / Document
// / Connection interfaces, a concrete `Tag` document, the connection wrappers,
// and Query.tag (single) + Query.tagConnection (list).
const BASE_SDL = /* GraphQL */ `
  scalar JSON
  type SystemInfo {
    filename: String!
    title: String
    basename: String!
    breadcrumbs(excludeExtension: Boolean): [String!]!
    path: String!
    relativePath: String!
    extension: String!
    template: String!
    collection: Collection!
  }
  type Collection {
    name: String!
    slug: String!
    label: String
    path: String!
    format: String
    matches: String
    templates: [JSON]
    fields: [JSON]
  }
  type PageInfo {
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String!
    endCursor: String!
  }
  interface Node { id: ID! }
  interface Document { id: ID! _sys: SystemInfo _values: JSON! }
  interface Connection { totalCount: Float! pageInfo: PageInfo! }
  type Tag implements Node & Document {
    name: String!
    id: ID!
    _sys: SystemInfo!
    _values: JSON!
  }
  type TagConnectionEdges { cursor: String! node: Tag }
  type TagConnection implements Connection {
    pageInfo: PageInfo!
    totalCount: Float!
    edges: [TagConnectionEdges]
  }
  type Query {
    tag(relativePath: String): Tag!
    tagConnection: TagConnection!
  }
`;

// Mirrors graphql-reducer.ts `astNodeWithMeta`: add `_tina_metadata` and
// `_content_source` to every interface and object type, producing the schema
// the local visual-editing resolver runs against.
const buildResolverSchema = (sdl: string): G.GraphQLSchema => {
  const ast = G.parse(sdl);
  const metaFieldDefs: G.FieldDefinitionNode[] = [
    '_tina_metadata',
    '_content_source',
  ].map((value) => ({
    kind: G.Kind.FIELD_DEFINITION,
    name: { kind: G.Kind.NAME, value },
    arguments: [],
    type: {
      kind: G.Kind.NON_NULL_TYPE,
      type: {
        kind: G.Kind.NAMED_TYPE,
        name: { kind: G.Kind.NAME, value: 'JSON' },
      },
    },
  }));
  return G.buildASTSchema({
    ...ast,
    definitions: ast.definitions.map((def) =>
      def.kind === G.Kind.INTERFACE_TYPE_DEFINITION ||
      def.kind === G.Kind.OBJECT_TYPE_DEFINITION
        ? { ...def, fields: [...(def.fields || []), ...metaFieldDefs] }
        : def
    ),
  });
};

const schemaForResolver = buildResolverSchema(BASE_SDL);

// What `resolveDocument` produces for a document: the form metadata used by
// `getFormAndFieldNameFromMetadata` to open the form and focus the field.
const documentMetadata = (id: string, prefix: string) => ({
  prefix,
  id,
  name: '',
  fields: { name: `${prefix ? `${prefix}.` : ''}name` },
});

const systemInfo = (name: string) => ({
  filename: name,
  title: name,
  basename: name,
  breadcrumbs: [name],
  path: `content/tags/${name}.json`,
  relativePath: `${name}.json`,
  extension: '.json',
  template: 'tag',
  collection: {
    name: 'tag',
    slug: 'tag',
    label: 'Tag',
    path: 'content/tags',
    format: 'json',
    matches: null,
    templates: null,
    fields: null,
  },
});

// Runs the expanded resolver query exactly like `processPayload`: only fields
// the query actually selects survive, and `_tina_metadata` falls back to a
// placeholder when a type carries none.
const runResolver = (query: string, rootValue: object) => {
  const expanded = expandQuery({
    schema: schemaForResolver,
    documentNode: G.parse(query),
    includeNodeMetadata: true,
  });
  return G.graphqlSync({
    schema: schemaForResolver,
    source: G.print(expanded),
    rootValue,
    fieldResolver: (source, _args, _ctx, info) => {
      if (info.fieldName === '_sys') return (source as any)._internalSys;
      if (info.fieldName === '_values') return (source as any)._internalValues;
      if (info.fieldName === '_tina_metadata') {
        return (source as any)._tina_metadata ?? { id: null, fields: [], prefix: '' };
      }
      if (info.fieldName === '_content_source') {
        const path = G.responsePathAsArray(info.path);
        return { queryId: 'q', path: path.slice(0, path.length - 1) };
      }
      return (source as any)[info.fieldName];
    },
  });
};

describe('expandQuery — visual editing metadata', () => {
  it('resolves the form and field for a single-document query', () => {
    const result = runResolver(`query { tag(relativePath: "a.json") { name } }`, {
      tag: {
        name: 'Tag A',
        __typename: 'Tag',
        _tina_metadata: documentMetadata('content/tags/a.json', 'tag'),
        _internalValues: { name: 'Tag A' },
        _internalSys: systemInfo('a'),
      },
    });

    expect(result.errors).toBeUndefined();
    expect(getFormAndFieldNameFromMetadata(result.data as object, 'tag.name')).toEqual({
      formId: 'content/tags/a.json',
      fieldName: 'name',
    });
  });

  it('resolves the form and field for a node inside a connection query', () => {
    const result = runResolver(
      `query { tagConnection { edges { node { name } } } }`,
      {
        tagConnection: {
          totalCount: 1,
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: false,
            startCursor: '',
            endCursor: '',
          },
          edges: [
            {
              cursor: 'c1',
              node: {
                name: 'Tag A',
                __typename: 'Tag',
                _tina_metadata: documentMetadata(
                  'content/tags/a.json',
                  'tagConnection.edges.0.node'
                ),
                _internalValues: { name: 'Tag A' },
                _internalSys: systemInfo('a'),
              },
            },
          ],
        },
      }
    );

    expect(result.errors).toBeUndefined();

    // The metadata must survive on the connection node — without
    // `includeNodeMetadata` it is stripped and click-to-edit cannot resolve
    // the form.
    const node = (result.data as any)?.tagConnection?.edges?.[0]?.node;
    expect(node?._tina_metadata?.id).toBe('content/tags/a.json');

    expect(
      getFormAndFieldNameFromMetadata(
        result.data as object,
        'tagConnection.edges.0.node.name'
      )
    ).toEqual({
      formId: 'content/tags/a.json',
      fieldName: 'name',
    });
  });

  it('ignores placeholder metadata on connection/edge wrapper types', () => {
    // Clicking at a wrapper level (no document beneath) must not resolve to the
    // empty placeholder metadata (id: null, prefix: '').
    const result = runResolver(
      `query { tagConnection { edges { node { name } } } }`,
      {
        tagConnection: {
          totalCount: 0,
          pageInfo: {
            hasPreviousPage: false,
            hasNextPage: false,
            startCursor: '',
            endCursor: '',
          },
          edges: [],
        },
      }
    );

    expect(result.errors).toBeUndefined();
    expect(
      getFormAndFieldNameFromMetadata(result.data as object, 'tagConnection')
    ).toEqual({ formId: undefined, fieldName: undefined });
  });
});
