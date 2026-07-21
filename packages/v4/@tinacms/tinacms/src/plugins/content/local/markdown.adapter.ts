import matter from 'gray-matter';
import type { FormatAdapter } from './format-adapters';

// Frontmatter is the document; the body stays out of it until a rich-text `isBody`
// field exists to own it — preserved via previousRaw meanwhile.
export const markdownAdapter = (extension: string): FormatAdapter => ({
  extension,
  parse: (raw) => matter(raw).data,
  serialize: (document, previousRaw) => {
    const previous = matter(previousRaw ?? '');
    return matter.stringify(previous.content, {
      ...previous.data,
      ...document,
    });
  },
});
