import { afterEach, describe, expect, it, vi } from 'vitest';
import { readPinned, writePinned } from './pane-pin';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('the error pane pin', () => {
  it('reads back what was written', () => {
    expect(readPinned()).toBe(false);
    writePinned(true);
    expect(readPinned()).toBe(true);
    writePinned(false);
    expect(readPinned()).toBe(false);
  });

  it('reads as not pinned and does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readPinned()).toBe(false);
    expect(() => writePinned(true)).not.toThrow();
  });
});
