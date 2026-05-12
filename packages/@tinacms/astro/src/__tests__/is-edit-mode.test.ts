import { describe, expect, it } from 'vitest';
import { EDIT_COOKIE, isEditMode } from '../is-edit-mode';

const cookie = `${EDIT_COOKIE}=1`;

const req = (headers: Record<string, string> = {}, search = '') =>
  new Request(`http://site/blog/post${search}`, { headers });

describe('isEditMode', () => {
  it('accepts ?tina-edit=1', () => {
    expect(isEditMode(req({}, '?tina-edit=1'))).toBe(true);
  });

  it('accepts iframe nav with admin Referer (initial preview load)', () => {
    expect(
      isEditMode(
        req({ 'Sec-Fetch-Dest': 'iframe', Referer: 'http://site/admin/' })
      )
    ).toBe(true);
  });

  it('accepts iframe nav with cookie (in-iframe link click)', () => {
    expect(
      isEditMode(
        req({
          'Sec-Fetch-Dest': 'iframe',
          Referer: 'http://site/blog/other',
          Cookie: cookie,
        })
      )
    ).toBe(true);
  });

  it('accepts SPA fetch with cookie', () => {
    expect(
      isEditMode(
        req({
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Site': 'same-origin',
          Cookie: cookie,
        })
      )
    ).toBe(true);
  });

  it('rejects SPA fetch without the cookie', () => {
    expect(
      isEditMode(
        req({ 'Sec-Fetch-Dest': 'empty', 'Sec-Fetch-Site': 'same-origin' })
      )
    ).toBe(false);
  });

  it('rejects cross-site fetch even with the cookie', () => {
    expect(
      isEditMode(
        req({
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Site': 'cross-site',
          Cookie: cookie,
        })
      )
    ).toBe(false);
  });

  it('rejects top-level document visits with a stale cookie', () => {
    expect(
      isEditMode(
        req({
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Site': 'none',
          Cookie: cookie,
        })
      )
    ).toBe(false);
  });
});
