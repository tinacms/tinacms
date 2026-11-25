import type { FieldProvision } from '../../core/plugin';
import { BOOLEAN_FIELD_TYPE } from './boolean/boolean-field.schema';
import { OBJECT_FIELD_TYPE } from './object/object-field.schema';
import { RICH_TEXT_FIELD_TYPE } from './rich-text/rich-text-field.type';

type StoredHelpers = NonNullable<FieldProvision['stored']>;

// Storage drops unset subfields, so a stored `{}` is a present object.
export const objectStored: StoredHelpers = {
  isEmpty: (value) => value == null,
  childrenWhenAbsent: true,
};

export const booleanStored: StoredHelpers = { isEmpty: () => false };

// The Backend sees the stored source, so no editor value is read here.
export const richTextStored: StoredHelpers = {
  isEmpty: (value) => typeof value !== 'string' || value.trim() === '',
  measure: () => null,
};

/**
 * The stored-value helpers of the core field plugins, with no plugin module in
 * the way. A Vite config that imports a plugin module bundles its lazy `client`
 * segment, and Node cannot load that `.tsx`. The local data layer uses this map
 * when it has collections and no config.
 */
export const coreStoredHelpers: ReadonlyMap<string, StoredHelpers> = new Map([
  [OBJECT_FIELD_TYPE, objectStored],
  [BOOLEAN_FIELD_TYPE, booleanStored],
  [RICH_TEXT_FIELD_TYPE, richTextStored],
]);
