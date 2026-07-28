import { describe, expect, it } from 'vitest';
import { FORMAT_EXTENSIONS, formatForPath } from './types';

// One mapping, two consumers that must agree: the format adapters decide which
// adapter owns a file, the rich-text codecs decide which parser reads its body.
// They read the same constant, so drift is impossible by construction — what is
// worth pinning is the matching itself.
describe('formatForPath', () => {
  it('tells .md and .mdx apart', () => {
    // '.md' is a prefix of '.mdx' everywhere but the dot, so a looser match
    // (includes, or stripping at the first dot) reads every .mdx file as
    // markdown and silently drops embeds on save.
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
    // Record<CollectionFormat, string> makes this a compile error rather than a
    // runtime gap; asserted anyway so the intent survives a type loosening.
    expect(
      Object.values(FORMAT_EXTENSIONS).every((ext) => ext.startsWith('.'))
    ).toBe(true);
  });
});
