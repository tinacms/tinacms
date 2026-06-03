import { resolveIsLocal } from './isLocal';

describe('resolveIsLocal', () => {
  const original = process.env.TINA_PUBLIC_IS_LOCAL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.TINA_PUBLIC_IS_LOCAL;
    } else {
      process.env.TINA_PUBLIC_IS_LOCAL = original;
    }
  });

  describe('when TINA_PUBLIC_IS_LOCAL is set', () => {
    it('is local when set to "true" (dev or build)', () => {
      process.env.TINA_PUBLIC_IS_LOCAL = 'true';
      expect(resolveIsLocal(true)).toBe(true);
      expect(resolveIsLocal(false)).toBe(true);
    });

    it('is not local when set to "false" (dev or build)', () => {
      process.env.TINA_PUBLIC_IS_LOCAL = 'false';
      expect(resolveIsLocal(true)).toBe(false);
      expect(resolveIsLocal(false)).toBe(false);
    });

    it('treats any non-"true" value as not local', () => {
      process.env.TINA_PUBLIC_IS_LOCAL = '1';
      expect(resolveIsLocal(true)).toBe(false);
    });
  });

  describe('when TINA_PUBLIC_IS_LOCAL is unset', () => {
    beforeEach(() => {
      delete process.env.TINA_PUBLIC_IS_LOCAL;
    });

    it('defaults to local for `tinacms dev`', () => {
      expect(resolveIsLocal(true)).toBe(true);
    });

    it('defaults to not local for `tinacms build`', () => {
      expect(resolveIsLocal(false)).toBe(false);
    });

    it('treats an empty string the same as unset', () => {
      process.env.TINA_PUBLIC_IS_LOCAL = '';
      expect(resolveIsLocal(true)).toBe(true);
      expect(resolveIsLocal(false)).toBe(false);
    });
  });
});
