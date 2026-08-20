import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from './parse';
import { serializeMDX } from './stringify';

/**
 * A hard break puts whatever follows it at the start of a line, and three kinds
 * of neighbour read differently there. Each of these corrupted content on
 * `main` before this stack, silently and with no editor involvement.
 */

const passthrough = (value: string) => value;

const mdxField: RichTextField = { name: 'body', type: 'rich-text' };

const markdownField: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
};

const templateField = {
  name: 'body',
  type: 'rich-text',
  templates: [
    {
      name: 'DateTime',
      label: 'DateTime',
      inline: true,
      fields: [{ name: 'format', type: 'string' }],
    },
  ],
} as unknown as RichTextField;

const emptyText = { type: 'text', text: '' };
const breakNode = { type: 'break', children: [emptyText] };
const text = (value: string) => ({ type: 'text', text: value });

const paragraph = (children: unknown[]) =>
  ({ type: 'root', children: [{ type: 'p', children }] }) as never;

const write = (tree: never, field: RichTextField) =>
  serializeMDX(tree, field, passthrough) as string;

const rewrite = (markdown: string, field: RichTextField) =>
  serializeMDX(parseMDX(markdown, field, passthrough), field, passthrough);

describe('a break next to a line-start-sensitive neighbour', () => {
  const html = {
    type: 'html_inline',
    value: '<em>x</em>',
    children: [emptyText],
  };

  it('keeps the word separation in front of raw html', () => {
    const written = write(paragraph([text('one'), breakNode, html]), mdxField);

    expect(written).toBe('one <em>x</em>\n');
    expect(written).not.toContain('\\');
  });

  it('does not promote an inline template out of its paragraph', () => {
    const embed = {
      type: 'mdxJsxTextElement',
      name: 'DateTime',
      props: { format: 'local' },
      children: [emptyText],
    };

    const written = write(
      paragraph([text('one'), breakNode, embed]),
      templateField
    );

    expect(written).not.toContain('\\');
    expect(parseMDX(written, templateField, passthrough).children).toHaveLength(
      1
    );
  });

  /**
   * A `mark` becomes an inline element with no matching template on a markdown
   * field, so it writes nothing — and the break in front of it became a
   * dangling `\` only at write time, after the trim had already run.
   */
  it('leaves no dangling backslash when the neighbour writes nothing', () => {
    const highlighted = { type: 'text', text: 'two', highlight: true };

    const written = write(
      paragraph([text('one'), breakNode, emptyText, highlighted]),
      markdownField
    );

    expect(written).toBe('one\n');
  });

  it.each([
    ['mdx', mdxField],
    ['markdown', markdownField],
  ])('reaches a fixed point on a %s field', (_name, field) => {
    const written = write(paragraph([text('one'), breakNode, html]), field);

    expect(rewrite(written, field)).toBe(written);
  });

  it('still writes a real break between two pieces of text', () => {
    expect(
      write(paragraph([text('one'), breakNode, text('two')]), mdxField)
    ).toBe('one\\\ntwo\n');
  });

  it('leaves a neighbour with no break in front of it alone', () => {
    expect(write(paragraph([text('one '), html]), mdxField)).toBe(
      'one <em>x</em>\n'
    );
  });
});

describe('opening and re-saving a file nobody edited', () => {
  it.each([
    ['a hard break before inline html', 'one\\\n<em>x</em>\n'],
    ['two spaces before inline html', 'one  \n<em>x</em>\n'],
  ])('does not inject a backslash into %s', (_name, source) => {
    const written = rewrite(source, mdxField) as string;

    expect(written).not.toContain('\\');
    expect(rewrite(written, mdxField)).toBe(written);
  });
});
