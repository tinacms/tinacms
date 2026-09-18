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
  /**
   * Where this field instance sits in the document, as a dotted path from the
   * form root: `title`, or `authors.1.alias` for a field inside an array item.
   * The same schema node validates at many addresses, one for each item, so a
   * rule reads this to know which instance it has. The form also keys its
   * errors by address, so a message returned here lands under this field.
   */
  address: string;
}

// A field-level validator sits in a collection, so it also sees the fields
// around it. `siblings` is the object the field sits in, not the document root.
export interface FieldValidationContext extends PluginValidationContext {
  siblings: TinaDocument;
  values: TinaDocument;
  /**
   * Whether the field holds no content. A field type that cannot answer this
   * with a generic check declares `isEmpty` on its descriptor; the rich-text
   * field does, because an empty paragraph is an empty document.
   */
  isEmpty: (value: unknown) => boolean;
  /**
   * The amount `min` and `max` compare, and the noun for their message.
   * A string measures its length, an array its items, a number its own value.
   * `null` means this field type has no amount to compare.
   */
  measure: (value: unknown) => FieldMeasure | null;
}

/** What `min` and `max` compare for a field type, and the noun for a message. */
export interface FieldMeasure {
  amount: number;
  unit?: string;
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
  /** Answers the built-in `required` validator for this field type. */
  isEmpty?: (value: TValue) => boolean;
  /** Answers the built-in `min` and `max` validators for this field type. */
  measure?: (value: TValue) => FieldMeasure | null;
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
