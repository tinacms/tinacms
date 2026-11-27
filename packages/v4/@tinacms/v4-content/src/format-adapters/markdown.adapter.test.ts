import { describe, expect, it } from 'vitest';
import { markdownAdapter } from './markdown.adapter';

const md = markdownAdapter('md');

const roundTrip = (raw: string) =>
  md.serialize(md.parse(raw, 'body'), raw, 'body', ['title', 'body']);

describe('markdownAdapter.serialize', () => {
  it.each([
    [
      'no blank line after the front matter',
      '---\ntitle: Hi\n---\nBody text\n',
    ],
    ['one blank line', '---\ntitle: Hi\n---\n\nBody text\n'],
    ['two blank lines', '---\ntitle: Hi\n---\n\n\nBody text\n'],
    ['CRLF and no blank line', '---\r\ntitle: Hi\r\n---\r\nBody text\r\n'],
  ])('returns the original bytes on an unchanged save with %s', (_, raw) => {
    expect(roundTrip(raw)).toBe(raw);
  });

  it('writes an edited body with one blank line after the front matter', () => {
    const raw = '---\ntitle: Hi\n---\nBody text\n';
    expect(
      md.serialize({ title: 'Hi', body: 'New text\n' }, raw, 'body', [
        'title',
        'body',
      ])
    ).toBe('---\ntitle: Hi\n---\n\nNew text\n');
  });
});
