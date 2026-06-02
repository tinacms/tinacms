import { isHeadingLevel, normalizeHeadingLevels } from './headingLevels';

describe('isHeadingLevel', () => {
  it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])('accepts %s', (level) => {
    expect(isHeadingLevel(level)).toBe(true);
  });
  it.each(['h0', 'h7', 'H1', 'heading1', '1', '', 'p'])(
    'rejects %s',
    (level) => {
      expect(isHeadingLevel(level)).toBe(false);
    }
  );
});

describe('normalizeHeadingLevels', () => {
  it('passes valid levels through unchanged', () => {
    expect(normalizeHeadingLevels(['h1', 'h2', 'h3'])).toEqual([
      'h1',
      'h2',
      'h3',
    ]);
  });
  it('drops invalid runtime values (pure-JS schema input)', () => {
    expect(normalizeHeadingLevels(['h1', 'h7', 'h2', 'H3'])).toEqual([
      'h1',
      'h2',
    ]);
  });
  it('dedupes', () => {
    expect(normalizeHeadingLevels(['h1', 'h2', 'h1', 'h2'])).toEqual([
      'h1',
      'h2',
    ]);
  });
  it('preserves declared order', () => {
    expect(normalizeHeadingLevels(['h3', 'h1', 'h2'])).toEqual([
      'h3',
      'h1',
      'h2',
    ]);
  });
  it('returns empty when no valid levels remain', () => {
    expect(normalizeHeadingLevels(['h7', 'h8'])).toEqual([]);
  });
  it('honors an explicit empty input', () => {
    expect(normalizeHeadingLevels([])).toEqual([]);
  });
});
