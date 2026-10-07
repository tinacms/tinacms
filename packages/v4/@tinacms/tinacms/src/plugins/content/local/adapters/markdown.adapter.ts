import matter from 'gray-matter';
import type { FormatAdapter } from './format-adapters';

const dropLayoutBlankLine = (body: string): string =>
  body.startsWith('\n') ? body.slice(1) : body;

const refuse = (language: string) => {
  const reject = () => {
    throw new Error(
      `${language} execution in frontmatter is not allowed for security reasons`
    );
  };
  return { parse: reject, stringify: reject };
};

/**
 * gray-matter runs `---js` front matter through eval(). Replace the engines
 * that execute code, so a document cannot run code when the adapter reads or
 * writes it. An options object also turns off the gray-matter parse cache.
 */
const MATTER_OPTIONS = {
  engines: {
    js: refuse('JavaScript'),
    javascript: refuse('JavaScript'),
    coffee: refuse('CoffeeScript'),
    coffeescript: refuse('CoffeeScript'),
  },
};

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
    const { data, content } = matter(toLineFeeds(raw), MATTER_OPTIONS);
    return bodyField
      ? { ...data, [bodyField]: dropLayoutBlankLine(content) }
      : data;
  },
  serialize: (document, previousRaw, bodyField) => {
    const crlf = previousRaw?.includes(CRLF) ?? false;
    const previous = matter(toLineFeeds(previousRaw ?? ''), MATTER_OPTIONS);
    const frontmatter = mergeFrontmatter(document, previous.data);
    if (bodyField != null) {
      delete frontmatter[bodyField];
    }
    const hasFrontmatter = Object.keys(frontmatter).length > 0;
    const content = bodyToWrite(
      document,
      previous.content,
      hasFrontmatter,
      bodyField
    );
    if (
      previousRaw !== undefined &&
      content === previous.content &&
      isSameValue(frontmatter, previous.data)
    ) {
      return previousRaw;
    }
    return toDocumentEol(
      matter.stringify(content, frontmatter, MATTER_OPTIONS),
      crlf
    );
  },
});

const bodyToWrite = (
  document: Record<string, unknown>,
  previousContent: string,
  hasFrontmatter: boolean,
  bodyField?: string
): string => {
  if (bodyField == null || !(bodyField in document)) return previousContent;
  const body = document[bodyField];
  if (typeof body !== 'string') {
    throw new Error(
      `Expected a string for body field "${bodyField}", received ${typeof body}.`
    );
  }
  return hasFrontmatter ? `\n${body}` : body;
};
