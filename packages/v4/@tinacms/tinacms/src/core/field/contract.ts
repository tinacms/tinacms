import type { ComponentType } from 'react';
import type { ZodType } from 'zod';
import type { JsonValue } from '../json';
import type { FieldSchema, TinaDocument } from '../schema/types';
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

export interface PluginValidationContext {
  node: FieldSchema;
  address: string;
}

// A field-level validator sits in a collection, so it also sees the fields
// around it. `siblings` is the object the field sits in, not the document root.
export interface FieldValidationContext extends PluginValidationContext {
  siblings: TinaDocument;
  values: TinaDocument;
}

export type Validate<TValue = unknown, TContext = PluginValidationContext> = (
  value: TValue,
  context: TContext
) => string | string[] | null;

// A validator takes its parameters from the collection (`{ name, args }` on
// the field) and returns the rule. It never hard-codes a sibling name.
export type ValidatorFactory = (
  ...args: JsonValue[]
) => Validate<unknown, FieldValidationContext>;

export type ValidatorRegistry = ReadonlyMap<string, ValidatorFactory>;

// What travels down a validation pass beside the field registry.
export interface ValidationScope {
  validators?: ValidatorRegistry;
  siblings?: TinaDocument;
  values?: TinaDocument;
}

export interface FieldDescriptor<TValue = unknown, TStored = unknown> {
  Component: ComponentType;
  defaultValue?: TValue;
  metadata?: FieldMetadata;
  schema?: (node: FieldSchema) => ZodType;
  validate?: Validate<TValue>;
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
    registry: FieldRegistry,
    scope?: ValidationScope
  ) => Record<string, string[]>;
}
