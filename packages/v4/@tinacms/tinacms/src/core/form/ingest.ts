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
    const stored = storedDocument?.[node.name];
    if (stored !== undefined) {
      values[node.name] = descriptor?.parse
        ? descriptor.parse(stored, node, context)
        : stored;
    } else if (descriptor?.defaultValue !== undefined) {
      values[node.name] = descriptor.defaultValue;
    }
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
    if (value === undefined) continue;
    const descriptor = registry.get(node.type);
    reconstructedDocument[node.name] = descriptor?.serialize
      ? descriptor.serialize(value, node, context)
      : value;
  }
  return reconstructedDocument;
};
