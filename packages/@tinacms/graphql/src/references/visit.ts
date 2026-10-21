import { parseMDX, serializeMDX } from '../mdx';
import type {
  Collectable,
  RichTextField,
  TinaField,
  TinaSchema,
} from '@tinacms/schema-tools';
import { lastItem } from '../util';

/** Marks where a rich-text field was parsed: later segments address tree nodes, not stored keys. */
export const MDX_SEGMENT = { mdx: true } as const;

export type LocatorSegment = string | number | typeof MDX_SEGMENT;

export type ReferenceVisit = {
  /** The stored value: the path of the document being referenced. */
  value: string;
  /** The collections the field may point at. The index records it under each. */
  collections: string[];
  /** The path to it, as keys and list indices from the document root. */
  locator: LocatorSegment[];
  /** Replaces the value in the document being walked. */
  replace: (next: string | null) => void;
};

export const encodeLocator = (locator: LocatorSegment[]): string =>
  JSON.stringify(locator);

type RichTextTree = ReturnType<typeof parseMDX>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Walks a stored document alongside its schema, visiting every reference it holds, and returns
 * whether any `replace` was called.
 *
 * The index build and the rename and delete rewrites all use this traversal, so they resolve the
 * same references.
 */
export const visitReferences = (
  data: Record<string, unknown>,
  collectable: Collectable,
  tinaSchema: TinaSchema,
  visit: (reference: ReferenceVisit) => void
): boolean => {
  // Each visit* reports whether a replacement occurred beneath it. A rich-text field uses that to
  // decide whether to reserialize.
  const visitCollectable = (
    collectableHere: Collectable,
    value: unknown,
    locator: LocatorSegment[]
  ): boolean => {
    if (!isRecord(value)) {
      return false;
    }
    let fields: TinaField<true>[] | undefined;
    try {
      fields = tinaSchema.getTemplateForData({
        data: value,
        collection: collectableHere,
      })?.fields;
    } catch {
      // Data matching no template cannot be indexed. Skip the subtree rather than throw, so one
      // invalid item does not discard the whole document.
      return false;
    }
    let replaced = false;
    for (const field of fields ?? []) {
      replaced = visitField(field, value, locator) || replaced;
    }
    return replaced;
  };

  const visitField = (
    field: TinaField<true>,
    parent: Record<string, unknown>,
    locator: LocatorSegment[]
  ): boolean => {
    // parseFile stores a markdown body as `$_body`; transformDocument renames it to the field's
    // name. The index reads the stored shape and the rewrites read the renamed one.
    const key =
      field.type === 'rich-text' && field.isBody && '$_body' in parent
        ? '$_body'
        : field.name;
    const value = parent[key];
    if (value === undefined || value === null) {
      return false;
    }
    const at = [...locator, field.name];
    let replaced = false;

    if (field.type === 'reference') {
      if (field.list && Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
          if (typeof item !== 'string' || item.length === 0) {
            continue;
          }
          visit({
            value: item,
            collections: field.collections ?? [],
            locator: [...at, index],
            replace: (next) => {
              value[index] = next;
              replaced = true;
            },
          });
        }
        return replaced;
      } else if (typeof value !== 'string' || value.length === 0) {
        return false;
      }
      visit({
        value,
        collections: field.collections ?? [],
        locator: at,
        replace: (next) => {
          parent[field.name] = next;
          replaced = true;
        },
      });
      return replaced;
    } else if (field.type === 'object') {
      if (field.list && Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
          replaced =
            visitCollectable(field as Collectable, item, [...at, index]) ||
            replaced;
        }
        return replaced;
      }
      return visitCollectable(field as Collectable, value, at);
    } else if (field.type === 'rich-text') {
      return visitRichText(field, parent, key, at);
    }
    return false;
  };

  const visitRichText = (
    field: RichTextField<true>,
    parent: Record<string, unknown>,
    key: string,
    at: LocatorSegment[]
  ): boolean => {
    const stored = parent[key];
    // A `slatejson` parser stores the tree itself; the others store text.
    const storedIsText = typeof stored === 'string';
    if (!storedIsText && !isRecord(stored)) {
      return false;
    }
    let tree: RichTextTree;
    if (storedIsText) {
      try {
        tree = parseMDX(stored, field, (value) => value);
      } catch {
        return false;
      }
    } else {
      // A `slatejson` field stores the tree itself. Its shape cannot be validated here.
      tree = stored as RichTextTree;
    }

    const replaced = visitNodes(tree?.children, field, [...at, MDX_SEGMENT]);

    // Reserialize only a field a replacement reached: the MDX writer normalizes as it writes. A
    // nested field is not text and is written out as part of this one.
    if (replaced && storedIsText) {
      parent[key] = serializeMDX(tree, field, (value) => value);
    }
    return replaced;
  };

  const visitNodes = (
    nodes: unknown,
    field: RichTextField<true>,
    at: LocatorSegment[]
  ): boolean => {
    if (!Array.isArray(nodes)) {
      return false;
    }
    const templates = field.templates ?? [];
    let replaced = false;
    for (const [index, node] of nodes.entries()) {
      if (!isRecord(node)) {
        continue;
      }
      const here = [...at, index];
      if (
        typeof node.name === 'string' &&
        (node.type === 'mdxJsxFlowElement' ||
          node.type === 'mdxJsxTextElement') &&
        isRecord(node.props)
      ) {
        const template = templates.find(
          (candidate) => lastItem(candidate.namespace) === node.name
        );
        for (const templateField of template?.fields ?? []) {
          replaced =
            visitField(templateField, node.props, [...here, 'props']) ||
            replaced;
        }
      }
      replaced =
        visitNodes(node.children, field, [...here, 'children']) || replaced;
    }
    return replaced;
  };

  return visitCollectable(collectable, data, []);
};
