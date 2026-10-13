import type { FormatAdapter } from './format-adapters';

export const jsonAdapter: FormatAdapter = {
  extension: '.json',
  parse: (raw) => JSON.parse(raw),
  serialize: (document, previousRaw) => {
    const previous = previousRaw ? JSON.parse(previousRaw) : {};
    return `${JSON.stringify({ ...previous, ...document }, null, 2)}\n`;
  },
};
