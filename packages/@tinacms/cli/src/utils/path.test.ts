import path from 'path';
/// <reference types="node" />
import type { stripNativeTrailingSlash as StripFn } from './path';
import type { PathTraversalError as PathTraversalErrorType } from './path';

// Use lazy require for assertPathWithinBase tests to avoid polluting the
// module registry before the stripNativeTrailingSlash mock tests run.
// Static (value) imports from './path' would cause Jest to cache the module
// with the real `path`, breaking the jest.doMock('path') re-require pattern.

describe('stripNativeTrailingSlash under Windows', () => {
  let stripNativeTrailingSlash: typeof StripFn;

  beforeAll(() => {
    const winPath = require('path').win32;
    jest.doMock('path', () => ({
      __esModule: true,
      default: winPath,
    }));

    stripNativeTrailingSlash = require('./path').stripNativeTrailingSlash;
  });

  afterAll(() => {
    jest.resetModules();
    jest.unmock('path');
  });

  it('strips single trailing backslash "\\"', () => {
    expect(stripNativeTrailingSlash('C:\\development\\tina\\')).toBe(
      'C:\\development\\tina'
    );
  });
  it('strips multiple trailing backslashes "\\"', () => {
    expect(stripNativeTrailingSlash('C:\\development\\tina\\\\\\\\\\\\')).toBe(
      'C:\\development\\tina'
    );
  });
  it('doesn\'t strip a forward slash "/"', () => {
    expect(stripNativeTrailingSlash('C:\\development\\tina/')).toBe(
      'C:\\development\\tina/'
    );
  });
  it('doesn\'t strip the "C:\\" root', () => {
    expect(stripNativeTrailingSlash('C:\\')).toBe('C:\\');
  });
  it('returns empty string on empty path', () => {
    expect(stripNativeTrailingSlash('')).toBe('');
  });
});

describe('stripNativeTrailingSlash under POSIX/UNIX', () => {
  let stripNativeTrailingSlash: typeof StripFn;

  beforeAll(() => {
    const posixPath = require('path').posix;
    jest.doMock('path', () => ({
      __esModule: true,
      default: posixPath,
    }));
    stripNativeTrailingSlash = require('./path').stripNativeTrailingSlash;
  });

  afterAll(() => {
    jest.resetModules();
    jest.unmock('path');
  });

  it('strips single trailing forward slash "/"', () => {
    expect(stripNativeTrailingSlash('/home/user/development/tina/')).toBe(
      '/home/user/development/tina'
    );
  });
  it('strips multiple trailing forward slashes "/"', () => {
    expect(stripNativeTrailingSlash('/home/user/development/tina//////')).toBe(
      '/home/user/development/tina'
    );
  });
  it('doesn\'t strip a backslash "\\"', () => {
    expect(stripNativeTrailingSlash('/home/user/development/tina\\')).toBe(
      '/home/user/development/tina\\'
    );
  });
  it('doesn\'t strip the "/" root', () => {
    expect(stripNativeTrailingSlash('/')).toBe('/');
  });
  it('returns empty string on empty path', () => {
    expect(stripNativeTrailingSlash('')).toBe('');
  });
});

describe('assertPathWithinBase', () => {
  const baseDir = '/app/public/uploads';

  // Lazy-require to avoid polluting module cache for the mock tests above
  let assertPathWithinBase: typeof import('./path').assertPathWithinBase;
  let PathTraversalError: typeof import('./path').PathTraversalError;

  beforeAll(() => {
    const mod = require('./path');
    assertPathWithinBase = mod.assertPathWithinBase;
    PathTraversalError = mod.PathTraversalError;
  });

  describe('valid paths (should not throw)', () => {
    it('allows a simple filename', () => {
      const result = assertPathWithinBase('image.png', baseDir);
      expect(result).toBe(path.resolve('/app/public/uploads/image.png'));
    });

    it('allows a subdirectory path', () => {
      const result = assertPathWithinBase('photos/vacation/beach.jpg', baseDir);
      expect(result).toBe(
        path.resolve('/app/public/uploads/photos/vacation/beach.jpg')
      );
    });

    it('allows an empty string (resolves to base)', () => {
      const result = assertPathWithinBase('', baseDir);
      expect(result).toBe(path.resolve(baseDir));
    });

    it('allows a path with harmless dot segments that stay within base', () => {
      const result = assertPathWithinBase(
        'photos/../photos/image.png',
        baseDir
      );
      expect(result).toBe(path.resolve('/app/public/uploads/photos/image.png'));
    });

    it('allows a single dot (current directory)', () => {
      const result = assertPathWithinBase('.', baseDir);
      expect(result).toBe(path.resolve(baseDir));
    });
  });

  describe('path traversal attacks (should throw)', () => {
    it('rejects simple ../ traversal', () => {
      expect(() =>
        assertPathWithinBase('../../../etc/passwd', baseDir)
      ).toThrow(PathTraversalError);
    });

    it('rejects single ../ that escapes base', () => {
      expect(() => assertPathWithinBase('../outside.txt', baseDir)).toThrow(
        PathTraversalError
      );
    });

    it('rejects traversal through a subdirectory', () => {
      expect(() =>
        assertPathWithinBase('subdir/../../../../etc/shadow', baseDir)
      ).toThrow(PathTraversalError);
    });

    it('rejects decoded percent-encoded traversal (%2e%2e)', () => {
      // The caller is expected to decode the URL before passing to this
      // function. This test simulates what happens when decoded dots are used.
      const decoded = decodeURIComponent('%2e%2e/%2e%2e/%2e%2e/etc/passwd');
      expect(() => assertPathWithinBase(decoded, baseDir)).toThrow(
        PathTraversalError
      );
    });

    it('rejects decoded percent-encoded slashes (%2F)', () => {
      const decoded = decodeURIComponent('..%2F..%2F..%2Fetc%2Fpasswd');
      expect(() => assertPathWithinBase(decoded, baseDir)).toThrow(
        PathTraversalError
      );
    });

    it('treats leading slash as relative (path.join strips it)', () => {
      // path.join('/base', '/etc/passwd') => '/base/etc/passwd'
      // This is safe — it stays within the base directory.
      const result = assertPathWithinBase('/etc/passwd', baseDir);
      expect(result).toBe(path.resolve('/app/public/uploads/etc/passwd'));
    });

    it('rejects path that is a prefix of base but not a child', () => {
      // e.g. base is /app/public/uploads, attacker tries /app/public/uploads-evil
      expect(() =>
        assertPathWithinBase('../uploads-evil/payload.txt', baseDir)
      ).toThrow(PathTraversalError);
    });

    it('includes the attempted path in the error message', () => {
      try {
        assertPathWithinBase('../../../etc/passwd', baseDir);
        fail('Expected PathTraversalError');
      } catch (error) {
        expect(error).toBeInstanceOf(PathTraversalError);
        expect((error as PathTraversalErrorType).message).toContain(
          '../../../etc/passwd'
        );
      }
    });
  });
});
