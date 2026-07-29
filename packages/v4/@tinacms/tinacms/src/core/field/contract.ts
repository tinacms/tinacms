import type { ComponentType } from 'react';
import type { ZodType } from 'zod';
import type { FieldSchema } from '../schema/types';

// The layout hint that a composite field reads to render a child. A composite field is
// an object, a list, or a rich-text field. The hint lets it render the child without a
// branch on the type of that child (ADR-009). An `inline` child renders in the line, for
// example a single-line input. A `block` child renders as its own section.
export type FieldLayout = 'inline' | 'block';

export interface FieldMetadata {
  layout?: FieldLayout;
  /**
   * Whether a host's `<label for>` can target this field's control. Defaults to true.
   * Set it false for a control HTML cannot label — a contenteditable is not a labelable
   * element, so `for` would point at nothing and the association would be worse than
   * none. Such a field names itself instead.
   */
  labelable?: boolean;
}

// What the transform of a field knows about its document, beyond its own schema node.
// The `documentPath` is the file that the value came from, and that it returns to. The
// extension of that file names the storage format, which lets a collection hold more
// than one format. The rich-text field selects its codec from it. Refer to
// rich-text-codecs.ts.
// The path is absent when a transform runs outside a document, such as in a unit test.
// The media paths will also read this when the media capability arrives.
export interface FieldTransformContext {
  documentPath?: string;
}

// The rendering half of a field plugin. Its type key sits on the manifest, in
// FieldProvision, and not here. The compile step needs that key, and must not import
// this file.
export interface FieldDescriptor<TValue = unknown, TStored = unknown> {
  Component: ComponentType;
  defaultValue?: TValue;
  metadata?: FieldMetadata;
  schema?: (node: FieldSchema) => ZodType;
  validate?: (value: TValue) => string | null;
  // The parse and serialize functions are the ingest and digest transforms of one
  // field. The string and boolean fields return the value as it is. The number field
  // converts between a string and a number. The image, datetime, and reference fields
  // will also use them, for a path and a media object, or an ISO string and a Date.
  // The `node` is the schema of the field. The rich-text field reads its templates from
  // the node, and parses the markdown into the MDX tree. The `context` is the document
  // above. The rich-text field reads it to select a codec for each file, and not for
  // each collection. A field with a value-only transform ignores both arguments.
  parse?: (
    stored: TStored,
    node: FieldSchema,
    context: FieldTransformContext
  ) => TValue;
  serialize?: (
    value: TValue,
    node: FieldSchema,
    context: FieldTransformContext
  ) => TStored;
  // Whether two editor values would write the same thing to the document. The form store
  // asks this to tell a real edit from a value that only looks new. A field whose value
  // is the value the document holds needs no answer here, because the store compares
  // those as structure. Refer to core/form/compare.ts for the case that does.
  isEqual?: (
    a: TValue,
    b: TValue,
    node: FieldSchema,
    context: FieldTransformContext
  ) => boolean;
}
