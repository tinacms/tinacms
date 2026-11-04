import type { FieldTransformContext } from '../../../core/field/contract';
import { ingestDocument } from '../../../core/form/ingest';
import type { FieldSchema, TinaDocument } from '../../../core/schema/types';
import { isRecord } from '../../../utils/is-record';
import {
  OBJECT_FIELD_TYPE,
  asObjectFieldSchema,
} from '../object/object-field.schema';

const storedSeed = (
  defaultItem: TinaDocument | undefined,
  fields: FieldSchema[]
): TinaDocument => {
  const stored: TinaDocument = {};
  for (const node of fields) {
    const value = defaultItem?.[node.name] ?? node.defaultValue;
    if (
      node.type === OBJECT_FIELD_TYPE &&
      (value === undefined || isRecord(value))
    ) {
      const nested = storedSeed(
        isRecord(value) ? value : undefined,
        asObjectFieldSchema(node).fields
      );
      if (value !== undefined || Object.keys(nested).length > 0) {
        stored[node.name] = nested;
      }
    } else if (value !== undefined) {
      stored[node.name] = structuredClone(value);
    }
  }
  return stored;
};

// ADR-029: a field `defaultValue` fills a new item only, including fields
// inside its objects. A loaded document never gets it.
export const seedItem = (
  defaultItem: TinaDocument | undefined,
  fields: FieldSchema[],
  context: FieldTransformContext
): TinaDocument =>
  ingestDocument(storedSeed(defaultItem, fields), fields, context);
