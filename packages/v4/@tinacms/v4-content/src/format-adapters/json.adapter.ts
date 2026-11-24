import type { FormatAdapter } from '../format-adapters';
import type { TinaDocument } from '../schema';
import { isSameValue } from './same-value';

export const jsonAdapter: FormatAdapter = {
  extension: '.json',
  parse: (raw) => JSON.parse(raw),
  serialize: (document, previousRaw, _bodyField, schemaKeys = []) => {
    const previous: TinaDocument = previousRaw ? JSON.parse(previousRaw) : {};
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
