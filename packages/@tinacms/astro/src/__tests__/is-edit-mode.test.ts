import { describe, expect, it } from 'vitest';
import { EDIT_COOKIE, isEditMode } from '../is-edit-mode';

function makeRequest(
  url: string,
  headers: Record<string, string> = {}
): Request {
  return new Request(url, { headers });
}

const editCookie = `${EDIT_COOKIE}=1`;

describe('isEditMode', () => {
  describe('iframe navigation', () => {
    it('accepts iframe + admin Referer (initial preview load)', () => {
      expect(
        isEditMode(
          makeRequest('http://site/blog/post-a', {
            'Sec-Fetch-Dest': 'iframe',
            Referer: 'http://site/admin/',
          })
        )
      ).toBe(true);
    });

    it('accepts iframe + cookie (in-iframe link click)', () => {
      expect(
        isEditMode(
          makeRequest('http://site/blog/post-a', {
            'Sec-Fetch-Dest': 'iframe',
            Referer: 'http://site/blog/post-b',
            Cookie: editCookie,
          })
        )
      ).toBe(true);
    });

    it('rejects iframe with non-admin Referer and no cookie', () => {
      expect(
        isEditMode(
          makeRequest('http://site/blog/post-a', {
            'Sec-Fetch-Dest': 'iframe',
            Referer: 'http://site/other',
          })
        )
      ).toBe(false);
    });
  });

  describe('SPA-style fetch (ClientRouter / Turbo / htmx)', () => {
    it('accepts fetch+same-origin+cookie (the regression we fix)', () => {
      expect(
        isEditMode(
          makeRequest('http://site/blog/post-a', {
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Site': 'same-origin',
            Cookie: editCookie,
          })
        )
      ).toBe(true);
    });

    it('rejects fetch without the cookie', () => {
      expect(
        isEditMode(
          makeRequest('http://site/blog/post-a', {
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Site': 'same-origin',
          })
        )
      ).toBe(false);
    });

    it('rejects cross-site fetch even with the cookie', () => {
      expect(
        isEditMode(
          makeRequest('http://site/blog/post-a', {
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Site': 'cross-site',
            Cookie: editCookie,
          })
        )
      ).toBe(false);
    });
  });

  describe('top-level browser visits', () => {
    it('rejects Sec-Fetch-Dest: document (direct page load) with stale cookie', () => {
      expect(
        isEditMode(
          makeRequest('http://site/blog/post-a', {
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Site': 'none',
            Cookie: editCookie,
          })
        )
      ).toBe(false);
    });

    it('rejects bare request with no Sec-Fetch headers and no cookie', () => {
      expect(isEditMode(makeRequest('http://site/blog/post-a'))).toBe(false);
    });
  });

  describe('explicit override', () => {
    it('accepts ?tina-edit=1 regardless of other signals', () => {
      expect(
        isEditMode(makeRequest('http://site/blog/post-a?tina-edit=1'))
      ).toBe(true);
    });
  });
});
