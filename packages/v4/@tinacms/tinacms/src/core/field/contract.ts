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

export interface FieldDescriptor<TValue = unknown, TStored = unknown> {
  type: string;
  Component: ComponentType;
  defaultValue?: TValue;
  metadata?: FieldMetadata;
  schema?: (node: FieldSchema) => ZodType;
  validate?: (value: TValue) => string | null;
  // parse/serialize are the per-field ingest/digest transforms. string/boolean are
  // identity; the number field uses them for string <-> number. image/datetime/reference
  // will use them too (e.g. path <-> media object, ISO string <-> Date).
  parse?: (stored: TStored) => TValue;
  serialize?: (value: TValue) => TStored;
}
