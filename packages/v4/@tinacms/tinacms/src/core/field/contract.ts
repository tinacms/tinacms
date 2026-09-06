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
  // A compound field reads this to parse, serialize, and validate its item
  // fields.
  registry: FieldRegistry;
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
  // A compound field validates its own item fields and returns their
  // messages as address -> messages. Key them off `address`, not `node.name`
  // — a nested compound field is not addressed by its bare name.
  validateChildren?: (
    value: TValue,
    node: FieldSchema,
    address: string,
    registry: FieldRegistry
  ) => Record<string, string[]>;
}
