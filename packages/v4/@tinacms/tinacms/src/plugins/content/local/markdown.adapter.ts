import matter from 'gray-matter';
import type { FormatAdapter } from './format-adapters';

// Frontmatter is the document; the markdown body rides under the collection's
// `isBody` field name when it has one.

// gray-matter splits at the closing `---\n`, so the blank line conventionally
// following it lands at the front of the body. That's file layout, not prose:
// dropped on the way in, written on the way out, so an untouched file
// round-trips byte-identically.
const dropLayoutBlankLine = (body: string): string =>
  body.startsWith('\n') ? body.slice(1) : body;

export const markdownAdapter = (extension: string): FormatAdapter => ({
  extension,
  parse: (raw, bodyField) => {
    const { data, content } = matter(raw);
    return bodyField
      ? { ...data, [bodyField]: dropLayoutBlankLine(content) }
      : data;
  },
  serialize: (document, previousRaw, bodyField) => {
    const previous = matter(previousRaw ?? '');
    const frontmatter = { ...previous.data, ...document };
    // Whether the SAVE mentions the body — asking the merged object instead would
    // also match a stale key of that name left in the file's own frontmatter.
    if (bodyField == null || !(bodyField in document)) {
      return matter.stringify(previous.content, frontmatter);
    }
    const body = document[bodyField];
    delete frontmatter[bodyField];
    // Only a string is a body: coercing a rich-text AST echoed back by a client
    // would write "[object Object]" as the whole file.
    if (typeof body !== 'string') {
      throw new Error(
        `Expected a string for body field "${bodyField}", received ${typeof body}.`
      );
    }
    return matter.stringify(`\n${body}`, frontmatter);
  },
});
