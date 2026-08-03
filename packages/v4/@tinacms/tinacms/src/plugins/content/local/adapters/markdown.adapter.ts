import matter from 'gray-matter';
import type { FormatAdapter } from './format-adapters';

const dropLayoutBlankLine = (body: string): string =>
  body.startsWith('\n') ? body.slice(1) : body;

const NO_MATTER_CACHE = {};

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
    const { data, content } = matter(raw, NO_MATTER_CACHE);
    return bodyField
      ? { ...data, [bodyField]: dropLayoutBlankLine(content) }
      : data;
  },
  serialize: (document, previousRaw, bodyField) => {
    const previous = matter(previousRaw ?? '', NO_MATTER_CACHE);
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
    return matter.stringify(content, frontmatter);
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
