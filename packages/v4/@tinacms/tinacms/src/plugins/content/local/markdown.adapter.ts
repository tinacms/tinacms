import matter from 'gray-matter';
import type { FormatAdapter } from './format-adapters';

// Frontmatter is the document, plus the markdown body under the collection's
// `isBody` field name when it has one (the rich-text field owns it). Without one
// the body is preserved untouched via previousRaw.
//
// The body crosses verbatim — gray-matter's leading newline included — so a save
// that doesn't edit it rewrites the file byte-identically.
export const markdownAdapter = (extension: string): FormatAdapter => ({
  extension,
  parse: (raw, bodyField) => {
    const { data, content } = matter(raw);
    return bodyField ? { ...data, [bodyField]: content } : data;
  },
  serialize: (document, previousRaw, bodyField) => {
    const previous = matter(previousRaw ?? '');
    const frontmatter = { ...previous.data, ...document };
    let body = previous.content;
    // Absent from the save (a partial update) means "leave the body alone".
    if (bodyField && bodyField in frontmatter) {
      body = String(frontmatter[bodyField] ?? '');
      delete frontmatter[bodyField];
    }
    return matter.stringify(body, frontmatter);
  },
});
