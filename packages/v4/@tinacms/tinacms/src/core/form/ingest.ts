import type { FieldTransformContext } from '../field/contract';
import type { FieldRegistry } from '../field/registry';
import type { FieldSchema, TinaDocument } from '../schema/types';

// The ingest and the digest are the only callers of the parse and serialize functions of
// a field, so the document context passes through here. It has a default, so a caller
// with no document is not affected. Those callers are the tests, and every field with a
// value-only transform.
const NO_DOCUMENT: FieldTransformContext = {};

// Flatten a document at the load (ADR-010). This turns a stored document into the
// initial values of the form. For each field, it runs the parse() of the field plugin,
// which converts the stored value into the editor value. When the key is absent, it uses
// the defaultValue of the field. The string and boolean fields return the value as it
// is. The number field converts a stored number into an editor string. The image,
// datetime, and reference fields will add their own transforms.
// Plan: the content capability supplies the document when the data layer arrives
// (ADR-019). Today the caller passes it.
export const ingestDocument = (
  storedDocument: TinaDocument | undefined,
  fields: FieldSchema[],
  registry: FieldRegistry,
  context: FieldTransformContext = NO_DOCUMENT
): TinaDocument => {
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

// Build the document again at the save (ADR-010). This turns the values of the form back
// into the shape of a document. It runs the serialize() of each field, which is the
// reverse of parse(). It drops an undefined value, and it keeps a null value.
// Plan: the result goes to the content capability, which writes it to git, to disk, and
// to TinaCloud (ADR-018). The document lifecycle hooks run first (ADR-014).
export const digestDocument = (
  values: TinaDocument | undefined,
  fields: FieldSchema[],
  registry: FieldRegistry,
  context: FieldTransformContext = NO_DOCUMENT
): TinaDocument => {
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
