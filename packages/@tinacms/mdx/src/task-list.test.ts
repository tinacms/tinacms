import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from './parse';
import { serializeMDX } from './stringify';

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

const TASK_LIST = '* [ ] task\n* [x] done\n';

describe('GFM task list items', () => {
  it('keeps the checked state on the parsed markdown list items', () => {
    const tree = parseMDX(TASK_LIST, markdownField, passthrough);
    expect(tree.children[0]).toMatchObject({
      type: 'ul',
      children: [
        { type: 'li', checked: false },
        { type: 'li', checked: true },
      ],
    });
  });

  it('keeps the checked state on the parsed mdx list items', () => {
    const tree = parseMDX(TASK_LIST, mdxField, passthrough);
    expect(tree.children[0]).toMatchObject({
      type: 'ul',
      children: [
        { type: 'li', checked: false },
        { type: 'li', checked: true },
      ],
    });
  });

  it('writes a markdown task list back unchanged', () => {
    const tree = parseMDX(TASK_LIST, markdownField, passthrough);
    expect(serializeMDX(tree, markdownField, passthrough)).toBe(TASK_LIST);
  });

  it('writes an mdx task list back unchanged', () => {
    const tree = parseMDX(TASK_LIST, mdxField, passthrough);
    expect(serializeMDX(tree, mdxField, passthrough)).toBe(TASK_LIST);
  });

  it('leaves a list with no checkboxes without a checked state', () => {
    const tree = parseMDX('* one\n* two\n', markdownField, passthrough);
    const list = tree.children[0] as { children: Record<string, unknown>[] };
    expect(list.children.every((item) => !('checked' in item))).toBe(true);
    expect(serializeMDX(tree, markdownField, passthrough)).toBe(
      '* one\n* two\n'
    );
  });
});
