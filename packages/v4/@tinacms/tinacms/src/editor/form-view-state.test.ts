import { describe, expect, it } from 'vitest';
import { countRevealedErrors } from './form-view-state';

const touched = (...addresses: string[]) => ({
  touched: new Set(addresses),
  saveAttempted: false,
});
const attempted = { touched: new Set<string>(), saveAttempted: true };

describe('countRevealedErrors', () => {
  const nested = ['seo.title', 'seo.og.image', 'seo.tags', 'seo.tags.0.name'];

  it('counts nothing before a field is touched or a save is tried', () => {
    expect(countRevealedErrors(touched(), nested, 'seo')).toBe(0);
  });

  it('counts each revealed leaf once, in a nested object and an array item', () => {
    expect(
      countRevealedErrors(
        touched('seo.title', 'seo.og.image', 'seo.tags.0.name'),
        nested,
        'seo'
      )
    ).toBe(3);
  });

  it('counts every failing field after a save is tried', () => {
    expect(countRevealedErrors(attempted, nested, 'seo')).toBe(3);
  });

  it('counts the array itself when only it is touched and its item error is not revealed yet', () => {
    expect(countRevealedErrors(touched('seo.tags'), nested, 'seo')).toBe(1);
  });

  it('counts an own error that has no child error', () => {
    expect(countRevealedErrors(touched('seo'), ['seo'], 'seo')).toBe(1);
  });

  it('ignores errors outside the address', () => {
    expect(countRevealedErrors(attempted, ['seos.title', 'other'], 'seo')).toBe(
      0
    );
  });
});
