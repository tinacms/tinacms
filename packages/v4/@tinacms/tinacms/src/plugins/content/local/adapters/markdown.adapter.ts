import matter from 'gray-matter';
import type { FormatAdapter } from './format-adapters';

const dropLayoutBlankLine = (body: string): string =>
  body.startsWith('\n') ? body.slice(1) : body;

const NO_MATTER_CACHE = {};

const CRLF = '\r\n';

/**
 * gray-matter and the markdown parser both carry a carriage return through to
 * the field value. The adapter reads a document in line feeds and writes it
 * back in the line ending the document came with.
 */
const toLineFeeds = (text: string): string => text.replace(/\r\n/g, '\n');

const toDocumentEol = (text: string, crlf: boolean): string =>
  crlf ? text.replace(/\n/g, CRLF) : text;

const isSameValue = (next: unknown, previous: unknown): boolean =>
  JSON.stringify(next) === JSON.stringify(previous);

const mergeFrontmatter = (
  document: Record<string, unknown>,
  previousData: Record<string, unknown>
): Record<string, unknown> => {
  const frontmatter: Record<string, unknown> = { ...previousData };
  for (const [key, value] of Object.entries(document)) {
    frontmatter[key] = isSameValue(value, previousData[key])
      ? previousData[key]
      : value;
  }
  return frontmatter;
};

export const markdownAdapter = (extension: string): FormatAdapter => ({
  extension,
  parse: (raw, bodyField) => {
    const { data, content } = matter(toLineFeeds(raw), NO_MATTER_CACHE);
    return bodyField
      ? { ...data, [bodyField]: dropLayoutBlankLine(content) }
      : data;
  },
  serialize: (document, previousRaw, bodyField) => {
    const crlf = previousRaw?.includes(CRLF) ?? false;
    const previous = matter(toLineFeeds(previousRaw ?? ''), NO_MATTER_CACHE);
    const frontmatter = mergeFrontmatter(document, previous.data);
    if (bodyField != null) {
      delete frontmatter[bodyField];
    }
    const content = bodyToWrite(document, previous.content, bodyField);
    if (
      previousRaw !== undefined &&
      content === previous.content &&
      isSameValue(frontmatter, previous.data)
    ) {
      return previousRaw;
    }
    return toDocumentEol(matter.stringify(content, frontmatter), crlf);
  },
});

const bodyToWrite = (
  document: Record<string, unknown>,
  previousContent: string,
  bodyField?: string
): string => {
  if (bodyField == null || !(bodyField in document)) return previousContent;
  const body = document[bodyField];
  if (typeof body !== 'string') {
    throw new Error(
      `Expected a string for body field "${bodyField}", received ${typeof body}.`
    );
  }
  return `\n${body}`;
};
