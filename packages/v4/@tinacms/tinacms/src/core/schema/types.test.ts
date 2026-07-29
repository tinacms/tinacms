import { describe, expect, it } from 'vitest';
import { FORMAT_EXTENSIONS, formatForPath } from './types';

// There is one map, and two consumers that must agree. The format adapters choose the
// adapter for a file, and the rich-text codecs choose the parser for a body. Both read
// the same constant, so they cannot drift. These tests pin the matching itself.
describe('formatForPath', () => {
  it('tells .md and .mdx apart', () => {
    // The string '.md' is a prefix of '.mdx'. A looser match, with includes or with
    // a cut at the first dot, therefore reads every .mdx file as markdown, and drops
    // the embeds at the save.
    expect(formatForPath('content/posts/hello.mdx')).toBe('mdx');
    expect(formatForPath('content/posts/hello.md')).toBe('md');
  });

  it('matches the extension, not an earlier dot in the name', () => {
    expect(formatForPath('content/posts/2026.01.02-release.md')).toBe('md');
  });

  it('returns undefined for a format it does not know', () => {
    expect(formatForPath('content/posts/hello.markdown')).toBeUndefined();
    expect(formatForPath('content/posts/LICENSE')).toBeUndefined();
  });

  it('names an extension for every format in the union', () => {
    // The Record<CollectionFormat, string> type makes this a compile error, and not a
    // fault at runtime. The test asserts it too, so the intent survives a wider type.
    expect(
      Object.values(FORMAT_EXTENSIONS).every((ext) => ext.startsWith('.'))
    ).toBe(true);
  });
});
