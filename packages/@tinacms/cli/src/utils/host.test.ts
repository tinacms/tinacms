import { isHostExposed } from './host';

describe('isHostExposed', () => {
  it('returns false for undefined (default)', () => {
    expect(isHostExposed(undefined)).toBe(false);
  });

  it('returns false for false (Vite default = localhost)', () => {
    expect(isHostExposed(false)).toBe(false);
  });

  it('returns false for "localhost"', () => {
    expect(isHostExposed('localhost')).toBe(false);
  });

  it('returns false for "127.0.0.1"', () => {
    expect(isHostExposed('127.0.0.1')).toBe(false);
  });

  it('returns false for "::1"', () => {
    expect(isHostExposed('::1')).toBe(false);
  });

  it('returns true for true (listen on all interfaces)', () => {
    expect(isHostExposed(true)).toBe(true);
  });

  it('returns true for "0.0.0.0"', () => {
    expect(isHostExposed('0.0.0.0')).toBe(true);
  });

  it('returns true for a LAN IP', () => {
    expect(isHostExposed('192.168.1.100')).toBe(true);
  });
});
