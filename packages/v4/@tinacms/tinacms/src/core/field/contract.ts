import type { ComponentType } from 'react';
import type { ZodType } from 'zod';
import type { FieldSchema } from '../schema/types';
import type { FieldRegistry } from './registry';

export type FieldLayout = 'inline' | 'block';

export interface FieldMetadata {
  layout?: FieldLayout;
  labelable?: boolean;
}

export interface FieldTransformContext {
  documentPath?: string;
  // Set by the form provider and the save path. A compound field (e.g. array)
  // reads it to parse/serialize/validate its item fields through the registry,
  // the same way the top-level form does.
  registry?: FieldRegistry;
}

export interface FieldDescriptor<TValue = unknown, TStored = unknown> {
  Component: ComponentType;
  defaultValue?: TValue;
  metadata?: FieldMetadata;
  schema?: (node: FieldSchema) => ZodType;
  validate?: (value: TValue) => string | null;
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
  isEqual?: (
    a: TValue,
    b: TValue,
    node: FieldSchema,
    context: FieldTransformContext
  ) => boolean;
  // A compound field (e.g. array) validates its item fields itself, through
  // `validateField`, and reports them here as flat address -> messages, keyed
  // the same way the top-level resolver keys its own errors. The resolver
  // merges these in beside the field's own `schema`/`validate` errors.
  validateChildren?: (
    value: TValue,
    node: FieldSchema,
    registry: FieldRegistry
  ) => Record<string, string[]>;
}
