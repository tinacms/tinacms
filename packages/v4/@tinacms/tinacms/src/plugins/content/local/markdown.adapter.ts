import matter from 'gray-matter';
import type { FormatAdapter } from './format-adapters';

// The frontmatter is the document. The markdown body travels under the name of the
// `isBody` field of the collection, when it has one.

// gray-matter splits the file at the closing `---\n`, so the blank line that usually
// follows it arrives at the front of the body. That line is file layout, and not prose.
// This adapter drops it at the read, and writes it at the save, so a file that no one
// edited keeps the same bytes.
const dropLayoutBlankLine = (body: string): string =>
  body.startsWith('\n') ? body.slice(1) : body;

// gray-matter keeps a process-wide cache keyed on the whole file when it is called with
// no options argument. The local data layer is a long-lived dev server, so that cache
// would hold every version of every file it ever read. An empty options object opts out.
const NO_MATTER_CACHE = {};

export const markdownAdapter = (extension: string): FormatAdapter => ({
  extension,
  parse: (raw, bodyField) => {
    const { data, content } = matter(raw, NO_MATTER_CACHE);
    return bodyField
      ? { ...data, [bodyField]: dropLayoutBlankLine(content) }
      : data;
  },
  serialize: (document, previousRaw, bodyField) => {
    const previous = matter(previousRaw ?? '', NO_MATTER_CACHE);
    const frontmatter = { ...previous.data, ...document };
    if (bodyField == null) {
      return matter.stringify(previous.content, frontmatter);
    }
    // In a collection whose body is the markdown body, a frontmatter key with that
    // name is always wrong. It is the result of an earlier bad write. This drops it
    // at every save, so the next save of any field repairs the file. It does not wait
    // for an edit to the body.
    delete frontmatter[bodyField];
    // This asks whether the save names the body. A test on the merged object would
    // also match the old key, and would then write it over the real body of the file.
    if (!(bodyField in document)) {
      return matter.stringify(previous.content, frontmatter);
    }
    const body = document[bodyField];
    // Only a string is a body. A rich-text tree that a client sent back would become
    // "[object Object]", and that string would be the whole file.
    if (typeof body !== 'string') {
      throw new Error(
        `Expected a string for body field "${bodyField}", received ${typeof body}.`
      );
    }
    return matter.stringify(`\n${body}`, frontmatter);
  },
});
