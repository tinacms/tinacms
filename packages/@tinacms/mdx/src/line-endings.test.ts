import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from './parse';

const passthrough = (value: string) => value;

const markdownField: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
};

const mdxField: RichTextField = {
  name: 'body',
  type: 'rich-text',
};

const textOf = (tree: { children: unknown[] }): unknown =>
  (tree.children[0] as { children: { text: string }[] }).children[0]?.text;

describe('a carriage return never reaches a text node', () => {
  it('drops it from a soft break in markdown', () => {
    expect(textOf(parseMDX('a\r\nb\r\n', markdownField, passthrough))).toBe(
      'a\nb'
    );
  });

  it('drops it from a soft break in mdx', () => {
    expect(textOf(parseMDX('a\r\nb\r\n', mdxField, passthrough))).toBe('a\nb');
  });

  it('reads a CRLF document as the same tree as an LF document', () => {
    expect(
      parseMDX('# Head\r\n\r\nOne.\r\ntwo.\r\n', markdownField, passthrough)
    ).toEqual(parseMDX('# Head\n\nOne.\ntwo.\n', markdownField, passthrough));
  });
});
