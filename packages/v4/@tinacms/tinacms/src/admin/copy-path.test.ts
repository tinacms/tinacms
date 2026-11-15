import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyPath } from './copy-path';

const useClipboard = (writeText: (text: string) => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });

describe('copyPath', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('copies the path and says so', async () => {
    const writeText = vi.fn(async () => {});
    useClipboard(writeText);
    await expect(copyPath('content/posts/hello.mdx')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('content/posts/hello.mdx');
  });

  it('says false when the clipboard refuses', async () => {
    useClipboard(() => Promise.reject(new Error('denied')));
    await expect(copyPath('a.mdx')).resolves.toBe(false);
  });

  it('says false when there is no clipboard', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    await expect(copyPath('a.mdx')).resolves.toBe(false);
  });
});
