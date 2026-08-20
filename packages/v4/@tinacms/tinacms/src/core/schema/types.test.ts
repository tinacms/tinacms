import { describe, expect, it } from 'vitest';
import { FORMAT_EXTENSIONS, formatForPath } from './types';

describe('formatForPath', () => {
  it('tells .md and .mdx apart', () => {
    expect(formatForPath('content/posts/hello.mdx')).toBe('mdx');
    expect(formatForPath('content/posts/hello.md')).toBe('md');
  });

  it('matches the extension, not an earlier dot in the name', () => {
    expect(formatForPath('content/posts/2026.01.02-release.md')).toBe('md');
  });

  it('reads the format whatever the case of the extension', () => {
    expect(formatForPath('content/posts/Hello.MDX')).toBe('mdx');
    expect(formatForPath('content/posts/Hello.Md')).toBe('md');
    expect(formatForPath('content/posts/DATA.JSON')).toBe('json');
  });

  it('returns undefined for a format it does not know', () => {
    expect(formatForPath('content/posts/hello.markdown')).toBeUndefined();
    expect(formatForPath('content/posts/LICENSE')).toBeUndefined();
  });

  it('names an extension for every format in the union', () => {
    expect(
      Object.values(FORMAT_EXTENSIONS).every((ext) => ext.startsWith('.'))
    ).toBe(true);
  });
});
