import type { ComponentType } from 'react';
import type { ZodType } from 'zod';
import type { FieldSchema } from '../schema/types';

// Layout hint a composite (object/list/rich-text) reads to decide how to render a
// child without branching on its type (ADR-009): `inline` = render in-line (e.g. a
// single-line input), `block` = render as its own block/section.
export type FieldLayout = 'inline' | 'block';

export interface FieldMetadata {
  layout?: FieldLayout;
}

// What a field's transform knows about the document it belongs to, beyond its own
// schema node. `documentPath` is the file the value came from and returns to — its
// extension names the storage format, which is what lets a collection hold mixed
// formats (rich-text picks its codec from it, mdx-codec.ts). Absent when a
// transform runs outside a document (a unit test, a future preview).
// Media-relative paths will read this too when the media capability lands.
export interface FieldTransformContext {
  documentPath?: string;
}

// The rendering half of a field plugin. Its type key lives on the manifest
// (FieldProvision), not here — the compile step needs the key without importing this.
export interface FieldDescriptor<TValue = unknown, TStored = unknown> {
  Component: ComponentType;
  defaultValue?: TValue;
  metadata?: FieldMetadata;
  schema?: (node: FieldSchema) => ZodType;
  validate?: (value: TValue) => string | null;
  // parse/serialize are the per-field ingest/digest transforms. string/boolean are
  // identity; the number field uses them for string <-> number. image/datetime/reference
  // will use them too (e.g. path <-> media object, ISO string <-> Date).
  // `node` is the field's own schema — rich-text reads its templates off it to parse
  // markdown into the mdx AST. `context` is the surrounding document (above), which
  // rich-text reads to pick a codec per file rather than per collection. Fields whose
  // transform is value-only ignore both.
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
}
