/// <reference types="node" />
import type { stripNativeTrailingSlash as StripFn } from './path';

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
