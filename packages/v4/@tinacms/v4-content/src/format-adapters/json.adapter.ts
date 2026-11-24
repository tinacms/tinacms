import type { FormatAdapter } from '../format-adapters';
import type { TinaDocument } from '../schema';
import { isSameValue } from './same-value';

const parseObject = (raw: string): TinaDocument => {
  const value: unknown = JSON.parse(raw);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('A JSON document must hold an object at the top level.');
  }
  return value as TinaDocument;
};

export const jsonAdapter: FormatAdapter = {
  extension: '.json',
  parse: parseObject,
  serialize: (document, previousRaw, _bodyField, schemaKeys = []) => {
    const previous: TinaDocument = previousRaw ? parseObject(previousRaw) : {};
    for (const key of schemaKeys) {
      if (!(key in document)) delete previous[key];
    }
    const next = { ...previous, ...document };
    // Like the markdown adapter, an unchanged document keeps the file's own
    // formatting, so a save that changes nothing makes no diff.
    if (previousRaw && isSameValue(next, JSON.parse(previousRaw))) {
      return previousRaw;
    }
    return `${JSON.stringify(next, null, 2)}\n`;
  },
};
