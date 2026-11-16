import { afterEach, beforeEach, expect, vi } from 'vitest';

/**
 * Makes every test of the file fail on a `console.error` or `console.warn`
 * call it did not expect. A test names each call it expects with `expect`.
 */
export const guardConsole = (): { expect: (pattern: RegExp) => void } => {
  let calls: string[] = [];
  let expected: RegExp[] = [];
  beforeEach(() => {
    calls = [];
    expected = [];
    for (const method of ['error', 'warn'] as const) {
      vi.spyOn(console, method).mockImplementation((...parts: unknown[]) => {
        calls.push(`${method}: ${parts.map(String).join(' ')}`);
      });
    }
  });
  afterEach(() => {
    const unexpected = calls.filter(
      (call) => !expected.some((pattern) => pattern.test(call))
    );
    const unseen = expected.filter(
      (pattern) => !calls.some((call) => pattern.test(call))
    );
    vi.restoreAllMocks();
    expect({ unexpected, unseen: unseen.map(String) }).toEqual({
      unexpected: [],
      unseen: [],
    });
  });
  return { expect: (pattern) => expected.push(pattern) };
};
