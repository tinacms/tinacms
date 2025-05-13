import { describe, expect, test } from 'vitest';
import { FilesystemBridge } from '../../src';
import file1 from './content/file1.md?raw';

const ABSOLUTE_CONTENT_PATH = `${__dirname}/content`;

describe('filesystem bridge', () => {
  describe.each([ABSOLUTE_CONTENT_PATH, './tests/filesystem-bridge/content'])(
    'globs markdown files',
    async (rootPath) => {
      test(`globs markdown files with path ${rootPath}`, async () => {
        const bridge = new FilesystemBridge(rootPath);
        const foundItems = await bridge.glob('', 'md');
        expect(foundItems.length).toEqual(2);
        expect(foundItems).toEqual(
          expect.arrayContaining(['file1.md', 'file2.md'])
        );
      });
    }
  );

  test('can get file content based on filename', async () => {
    const bridge = new FilesystemBridge(ABSOLUTE_CONTENT_PATH);
    const itemContent = await bridge.get('file1.md');
    expect(file1).toEqual(itemContent);
  });
});
