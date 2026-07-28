import matter from 'gray-matter';
import type { FormatAdapter } from './format-adapters';

// Frontmatter is the document, plus the markdown body under the collection's
// `isBody` field name when it has one (the rich-text field owns it). Without one
// the body is preserved untouched via previousRaw.
//
// gray-matter splits a file at the closing `---\n` and nothing else, so the blank
// line that conventionally follows it lands at the front of `content`. That
// separator belongs to the file's layout, not to the prose, so this strips it on
// the way in and writes it back on the way out. The body a field sees therefore
// starts at the first character the author typed, and a file that round-trips
// unedited is byte-identical.
const LEADING_SEPARATOR = /^\n/;

const stripSeparator = (content: string): string =>
  content.replace(LEADING_SEPARATOR, '');

export const markdownAdapter = (extension: string): FormatAdapter => ({
  extension,
  parse: (raw, bodyField) => {
    const { data, content } = matter(raw);
    return bodyField ? { ...data, [bodyField]: stripSeparator(content) } : data;
  },
  serialize: (document, previousRaw, bodyField) => {
    const previous = matter(previousRaw ?? '');
    const frontmatter = { ...previous.data, ...document };
    // A save that doesn't mention the body field isn't editing the body.
    const isEditingBody = bodyField != null && bodyField in frontmatter;
    if (!isEditingBody) {
      return matter.stringify(previous.content, frontmatter);
    }
    const saved = frontmatter[bodyField];
    delete frontmatter[bodyField];
    // Only a string is a body. Coercing would stringify a rich-text AST echoed
    // back by a client into "[object Object]" and write that as the entire file;
    // refusing leaves the body already on disk intact.
    if (typeof saved !== 'string') {
      throw new Error(
        `Expected a string for body field "${bodyField}", received ${typeof saved}.`
      );
    }
    return matter.stringify(`\n${saved}`, frontmatter);
  },
});
