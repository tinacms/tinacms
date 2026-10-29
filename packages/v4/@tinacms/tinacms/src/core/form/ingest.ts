import type { FieldTransformContext } from '../field/contract';
import type { FieldSchema, TinaDocument } from '../schema/types';

export const ingestDocument = (
  storedDocument: TinaDocument | undefined,
  fields: FieldSchema[],
  context: FieldTransformContext
): TinaDocument => {
  const { registry } = context;
  const values: TinaDocument = {};
  for (const node of fields) {
    const descriptor = registry.get(node.type);
    // Only an absent key gets the field default. A present `null` is a cleared
    // value, which `digestDocument` keeps for a field that has a default.
    const raw = storedDocument?.[node.name];
    const stored =
      raw === undefined && node.defaultValue !== undefined
        ? structuredClone(node.defaultValue)
        : raw;
    if (stored === undefined) {
      values[node.name] = descriptor?.defaultValue ?? null;
      continue;
    }
    const parsed = descriptor?.parse
      ? descriptor.parse(stored, node, context)
      : stored;
    values[node.name] = parsed ?? null;
  }
  return values;
};

export const digestDocument = (
  values: TinaDocument | undefined,
  fields: FieldSchema[],
  context: FieldTransformContext
): TinaDocument => {
  const { registry } = context;
  const reconstructedDocument: TinaDocument = {};
  for (const node of fields) {
    const value = values?.[node.name];
    if (value === null && node.defaultValue !== undefined) {
      // Written as-is, past `serialize`: a missing key would bring the default back.
      reconstructedDocument[node.name] = null;
      continue;
    }
    if (value == null) continue;
    const descriptor = registry.get(node.type);
    reconstructedDocument[node.name] = descriptor?.serialize
      ? descriptor.serialize(value, node, context)
      : value;
  }
  return reconstructedDocument;
};
