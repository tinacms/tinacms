import type { TinaDocument } from '../../../../core/schema/types';
import type { FormatAdapter } from './format-adapters';

export const jsonAdapter: FormatAdapter = {
  extension: '.json',
  parse: (raw) => JSON.parse(raw),
  serialize: (document, previousRaw, _bodyField, schemaKeys = []) => {
    const previous: TinaDocument = previousRaw ? JSON.parse(previousRaw) : {};
    for (const key of schemaKeys) {
      if (!(key in document)) delete previous[key];
    }
    return `${JSON.stringify({ ...previous, ...document }, null, 2)}\n`;
  },
};
