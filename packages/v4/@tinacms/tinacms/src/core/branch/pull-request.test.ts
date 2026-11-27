import { describe, expect, it } from 'vitest';
import { parsePullRequest } from './pull-request';

describe('parsePullRequest', () => {
  it('keeps the digits as written, leading zeros included', () => {
    expect(
      parsePullRequest('https://github.com/acme/site/pull/0042')?.number
    ).toBe('0042');
  });

  it('leaves the number out when the link does not end in digits', () => {
    expect(parsePullRequest('https://github.com/acme/site/pulls')).toEqual({
      href: 'https://github.com/acme/site/pulls',
    });
  });

  it('refuses a link that is not http or https', () => {
    expect(parsePullRequest('javascript:alert(1)')).toBeNull();
  });
});
