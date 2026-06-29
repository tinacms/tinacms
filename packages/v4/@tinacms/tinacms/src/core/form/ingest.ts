import type { FieldRegistry } from '../field/registry';
import type { FieldSchema, TinaDocument } from '../schema/types';

// Flatten on load (ADR-010): turn a stored document into the form's initial values.
// Per field, run the field plugin's parse() (stored → editor value), or fall back to
// its defaultValue when the key is absent. Every field is identity today (string);
// image/datetime/reference will plug real transforms in here.
// Plan: the document source becomes the content capability (ADR-019) once the data
// layer lands — today it's passed in directly.
export const ingestDocument = (
  storedDocument: TinaDocument | undefined,
  fields: FieldSchema[],
  registry: FieldRegistry
): TinaDocument => {
  const values: TinaDocument = {};
  for (const node of fields) {
    const descriptor = registry.get(node.type);
    const stored = storedDocument?.[node.name];
    if (stored !== undefined) {
      values[node.name] = descriptor?.parse ? descriptor.parse(stored) : stored;
    } else if (descriptor?.defaultValue !== undefined) {
      values[node.name] = descriptor.defaultValue;
    }
  }
  return values;
};

// Reconstruct on save (ADR-010): turn the form's values back into document shape,
// running each field's serialize() (the reverse of parse). Undefined values are
// dropped (absent); null is preserved.
// Plan: the result is handed to the content capability (ADR-018 save flow) to write
// to git/disk + TinaCloud, after the document lifecycle hooks (ADR-014) run.
export const digestDocument = (
  values: TinaDocument | undefined,
  fields: FieldSchema[],
  registry: FieldRegistry
): TinaDocument => {
  const reconstructedDocument: TinaDocument = {};
  for (const node of fields) {
    const value = values?.[node.name];
    if (value === undefined) continue;
    const descriptor = registry.get(node.type);
    reconstructedDocument[node.name] = descriptor?.serialize
      ? descriptor.serialize(value)
      : value;
  }
  return reconstructedDocument;
};
