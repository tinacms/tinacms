// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { EDIT_COOKIE_HEADER, isEditMode, readCookie } from './edit-mode';

function request(url: string, headers: Record<string, string> = {}): Request {
  return new Request(url, { headers });
}

describe('isEditMode', () => {
  it('is true for an explicit `?tina-edit=1`', () => {
    expect(isEditMode(request('http://site.test/post?tina-edit=1'))).toBe(true);
  });

  it('is false for a top-level visit, even with the edit cookie', () => {
    expect(
      isEditMode(
        request('http://site.test/post', {
          'Sec-Fetch-Dest': 'document',
          Cookie: '__tina_edit=1',
        })
      )
    ).toBe(false);
  });

  it('is true for an iframe loaded from the same-origin admin', () => {
    expect(
      isEditMode(
        request('http://site.test/post', {
          'Sec-Fetch-Dest': 'iframe',
          Referer: 'http://site.test/admin/index.html',
        })
      )
    ).toBe(true);
  });

  it('ignores an admin Referer from another origin', () => {
    expect(
      isEditMode(
        request('http://site.test/post', {
          'Sec-Fetch-Dest': 'iframe',
          Referer: 'http://other.test/admin/index.html',
        })
      )
    ).toBe(false);
  });

  it('falls back to the edit cookie inside an iframe', () => {
    expect(
      isEditMode(
        request('http://site.test/next', {
          'Sec-Fetch-Dest': 'iframe',
          Referer: 'not a url',
          Cookie: 'theme=dark; __tina_edit=1',
        })
      )
    ).toBe(true);
  });

  it('is false in an iframe without any edit signal', () => {
    expect(
      isEditMode(
        request('http://site.test/post', { 'Sec-Fetch-Dest': 'iframe' })
      )
    ).toBe(false);
  });
});

describe('readCookie', () => {
  it('reads a cookie by exact name', () => {
    const req = request('http://site.test/', {
      Cookie: 'a=1; __tina_edit_x=2; __tina_edit=3',
    });
    expect(readCookie(req, '__tina_edit')).toBe('3');
    expect(readCookie(req, 'missing')).toBeNull();
  });

  it('returns null without a Cookie header', () => {
    expect(readCookie(request('http://site.test/'), 'a')).toBeNull();
  });
});

describe('EDIT_COOKIE_HEADER', () => {
  it('is a short-lived, strict, site-wide cookie', () => {
    expect(EDIT_COOKIE_HEADER).toBe(
      '__tina_edit=1; Path=/; SameSite=Strict; Max-Age=3600'
    );
  });
});
