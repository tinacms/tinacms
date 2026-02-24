import path from 'path';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { FilesystemBridge } from '../../src';
import { AuditFileSystemBridge } from '../../src/database/bridge/filesystem';
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

  describe('path traversal rejection', () => {
    const bridge = new FilesystemBridge(ABSOLUTE_CONTENT_PATH);

    test('get rejects traversal', async () => {
      await expect(bridge.get('../../../etc/passwd')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    test('put rejects traversal', async () => {
      await expect(
        bridge.put('../../etc/malicious', 'payload')
      ).rejects.toThrow('Path traversal detected');
    });

    test('delete rejects traversal', async () => {
      await expect(bridge.delete('../outside.txt')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    test('glob rejects traversal', async () => {
      await expect(bridge.glob('../..', 'md')).rejects.toThrow(
        'Path traversal detected'
      );
    });
  });
});

describe('AuditFileSystemBridge', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(
      process.env.TMPDIR || '/tmp',
      `tinacms-audit-bridge-${Date.now()}`
    );
    await fs.mkdirp(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  test('put writes allowed generated files', async () => {
    const bridge = new AuditFileSystemBridge(tmpDir);
    await bridge.put('tina/__generated__/_schema.json', '{"test":true}');
    const content = await fs.readFile(
      path.join(tmpDir, 'tina/__generated__/_schema.json'),
      'utf-8'
    );
    expect(content).toBe('{"test":true}');
  });

  test('put silently skips non-generated files', async () => {
    const bridge = new AuditFileSystemBridge(tmpDir);
    await bridge.put('content/posts/evil.md', 'should not be written');
    const exists = await fs.pathExists(
      path.join(tmpDir, 'content/posts/evil.md')
    );
    expect(exists).toBe(false);
  });
});
