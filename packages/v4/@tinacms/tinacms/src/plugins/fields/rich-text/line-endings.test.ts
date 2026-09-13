import { describe, expect, it } from 'vitest';
import { t } from '../../../index';
import { formatAdapterFor } from '../../content/local/adapters/format-adapters';
import { markdownCodec } from './markdown.codec';
import { mdxCodec } from './mdx.codec';

const body = t.richText({ name: 'body' });

describe('a carriage return never reaches the editor', () => {
  it('keeps it out of a .md text node', () => {
    const parsed = markdownCodec.parse('a\r\nb\r\n', body);
    expect(JSON.stringify(parsed)).not.toContain('\\r');
  });

  it('keeps it out of a .mdx text node', () => {
    const parsed = mdxCodec.parse('a\r\nb\r\n', body);
    expect(JSON.stringify(parsed)).not.toContain('\\r');
  });
});

describe('a CRLF document keeps its line endings', () => {
  const adapter = formatAdapterFor('md');
  const RAW = '---\r\ntitle: Hello\r\n---\r\n\r\nOne.\r\ntwo.\r\n';

  it('rewrites an untouched CRLF document byte-identically', () => {
    const stored = adapter.parse(RAW, 'body');
    expect(adapter.serialize(stored, RAW, 'body')).toBe(RAW);
  });

  it('writes an edited CRLF document back with CRLF', () => {
    const stored = adapter.parse(RAW, 'body');
    const written = adapter.serialize(
      { ...stored, body: 'Three.\n' },
      RAW,
      'body'
    );
    expect(written).toBe('---\r\ntitle: Hello\r\n---\r\n\r\nThree.\r\n');
  });

  it('leaves an LF document on LF', () => {
    const lf = '---\ntitle: Hello\n---\n\nOne.\n';
    const stored = adapter.parse(lf, 'body');
    expect(adapter.serialize({ ...stored, body: 'Two.\n' }, lf, 'body')).toBe(
      '---\ntitle: Hello\n---\n\nTwo.\n'
    );
  });

  it('hands the body to the codec with no carriage return in it', () => {
    expect(adapter.parse(RAW, 'body').body).toBe('One.\ntwo.\n');
  });
});
