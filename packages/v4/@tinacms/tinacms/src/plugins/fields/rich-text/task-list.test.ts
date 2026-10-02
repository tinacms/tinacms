import { describe, expect, it } from 'vitest';
import { t } from '../../../index';
import { markdownCodec } from './markdown.codec';
import { mdxCodec } from './mdx.codec';

const body = t.richText({ name: 'body' });
const TASK_LIST = '* [ ] task\n* [x] done\n';

describe('a task list survives a save', () => {
  it('keeps the checkboxes in a .md body', () => {
    expect(
      markdownCodec.serialize(markdownCodec.parse(TASK_LIST, body), body)
    ).toBe(TASK_LIST);
  });

  it('keeps the checkboxes in a .mdx body', () => {
    expect(mdxCodec.serialize(mdxCodec.parse(TASK_LIST, body), body)).toBe(
      TASK_LIST
    );
  });

  it('reads the checked state onto the list items', () => {
    const parsed = markdownCodec.parse(TASK_LIST, body);
    expect(parsed.children[0]).toMatchObject({
      type: 'ul',
      children: [
        { type: 'li', checked: false },
        { type: 'li', checked: true },
      ],
    });
  });
});
