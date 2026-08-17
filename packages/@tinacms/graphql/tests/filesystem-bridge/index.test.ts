import os from 'os';
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

    test('get rejects backslash traversal', async () => {
      await expect(bridge.get('x\\..\\..\\..\\etc\\passwd')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    test('get rejects null bytes', async () => {
      await expect(bridge.get('file\0.md')).rejects.toThrow('null bytes');
    });

    test('put rejects backslash traversal', async () => {
      await expect(
        bridge.put('x\\..\\..\\..\\etc\\malicious', 'payload')
      ).rejects.toThrow('Path traversal detected');
    });

    test('put rejects null bytes', async () => {
      await expect(bridge.put('file\0.md', 'payload')).rejects.toThrow(
        'null bytes'
      );
    });

    test('delete rejects backslash traversal', async () => {
      await expect(bridge.delete('x\\..\\..\\outside.txt')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    test('delete rejects null bytes', async () => {
      await expect(bridge.delete('file\0.md')).rejects.toThrow('null bytes');
    });

    test('glob rejects backslash traversal', async () => {
      await expect(bridge.glob('x\\..\\..\\..', 'md')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    test('glob rejects null bytes', async () => {
      await expect(bridge.glob('content\0', 'md')).rejects.toThrow(
        'null bytes'
      );
    });
  });

  describe('symlink traversal', () => {
    let tmpDir: string;
    let outsideDir: string;

    beforeEach(async () => {
      tmpDir = path.join(os.tmpdir(), `tina-bridge-symlink-${Date.now()}`);
      outsideDir = path.join(os.tmpdir(), `tina-bridge-outside-${Date.now()}`);
      await fs.mkdirp(tmpDir);
      await fs.mkdirp(outsideDir);
      await fs.writeFile(path.join(outsideDir, 'secret.txt'), 'sensitive');
      await fs.symlink(outsideDir, path.join(tmpDir, 'escape'));
    });

    afterEach(async () => {
      await fs.remove(tmpDir);
      await fs.remove(outsideDir);
    });

    test('get rejects symlink escaping base', async () => {
      const bridge = new FilesystemBridge(tmpDir);
      await expect(bridge.get('escape/secret.txt')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    test('put rejects symlink escaping base', async () => {
      const bridge = new FilesystemBridge(tmpDir);
      await expect(bridge.put('escape/newfile.txt', 'payload')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    test('delete rejects symlink escaping base', async () => {
      const bridge = new FilesystemBridge(tmpDir);
      await expect(bridge.delete('escape/secret.txt')).rejects.toThrow(
        'Path traversal detected'
      );
    });
  });
});

describe('multi-repo routing (rootPath vs outputPath)', () => {
  let generatorDir: string;
  let contentDir: string;

  beforeEach(async () => {
    const stamp = Date.now();
    generatorDir = path.join(os.tmpdir(), `tinacms-bridge-gen-${stamp}`);
    contentDir = path.join(os.tmpdir(), `tinacms-bridge-content-${stamp}`);
    await fs.mkdirp(generatorDir);
    await fs.mkdirp(contentDir);
  });

  afterEach(async () => {
    await fs.remove(generatorDir);
    await fs.remove(contentDir);
  });

  test('put writes tina/__generated__/* to rootPath, never outputPath', async () => {
    const bridge = new FilesystemBridge(generatorDir, contentDir);
    await bridge.put('tina/__generated__/_schema.json', '{"x":1}');

    expect(
      await fs.pathExists(
        path.join(generatorDir, 'tina/__generated__/_schema.json')
      )
    ).toBe(true);
    expect(
      await fs.pathExists(
        path.join(contentDir, 'tina/__generated__/_schema.json')
      )
    ).toBe(false);
  });

  test('get reads tina/__generated__/* from rootPath', async () => {
    const bridge = new FilesystemBridge(generatorDir, contentDir);
    await fs.outputFile(
      path.join(generatorDir, 'tina/__generated__/_graphql.json'),
      '{"fromGenerator":true}'
    );
    await fs.outputFile(
      path.join(contentDir, 'tina/__generated__/_graphql.json'),
      '{"fromContent":true}'
    );

    const result = await bridge.get('tina/__generated__/_graphql.json');
    expect(result).toBe('{"fromGenerator":true}');
  });

  test('routes .tina/__generated__/* (legacy) to rootPath as well', async () => {
    const bridge = new FilesystemBridge(generatorDir, contentDir);
    await bridge.put('.tina/__generated__/_lookup.json', '{"k":"v"}');

    expect(
      await fs.pathExists(
        path.join(generatorDir, '.tina/__generated__/_lookup.json')
      )
    ).toBe(true);
  });

  test('content files still route to outputPath', async () => {
    const bridge = new FilesystemBridge(generatorDir, contentDir);
    await bridge.put('rules/example/index.md', 'body');

    expect(
      await fs.pathExists(path.join(contentDir, 'rules/example/index.md'))
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(generatorDir, 'rules/example/index.md'))
    ).toBe(false);
  });

  test('delete respects the same routing', async () => {
    const bridge = new FilesystemBridge(generatorDir, contentDir);
    const genFile = path.join(generatorDir, 'tina/__generated__/_schema.json');
    const contentFile = path.join(contentDir, 'rules/doomed.md');
    await fs.outputFile(genFile, '{"x":1}');
    await fs.outputFile(contentFile, 'content');

    await bridge.delete('tina/__generated__/_schema.json');
    await bridge.delete('rules/doomed.md');

    expect(await fs.pathExists(genFile)).toBe(false);
    expect(await fs.pathExists(contentFile)).toBe(false);
  });

  test('directory-only path (no trailing slash) routes to outputPath, not rootPath', async () => {
    // Boundary case: isGeneratedPath uses startsWith('tina/__generated__/').
    // The exact directory string `tina/__generated__` (no trailing slash)
    // does not match the prefix and therefore routes to outputPath. This is
    // documented intentional — bridge callers always pass file paths, never
    // bare directory names. Pinning the boundary here so a future regression
    // (e.g. adding directory operations) gets caught.
    const bridge = new FilesystemBridge(generatorDir, contentDir);
    await fs.outputFile(
      path.join(contentDir, 'tina/__generated__'),
      'sentinel'
    );

    const result = await bridge.get('tina/__generated__');
    expect(result).toBe('sentinel');
  });

  test('assertWithinBase still rejects path traversal that escapes the routed base', async () => {
    // The routing picks rootPath because the path starts with
    // `tina/__generated__/`, but the trailing `..`s walk past rootPath itself
    // — assertWithinBase must throw. This pins that the security check still
    // runs, just against the chosen base.
    const traversalPath =
      'tina/__generated__/../../../../../../../../etc/escape.txt';
    const bridge = new FilesystemBridge(generatorDir, contentDir);
    await expect(bridge.put(traversalPath, 'pwned')).rejects.toThrow(
      /traversal/i
    );
    await expect(bridge.get(traversalPath)).rejects.toThrow(/traversal/i);
    await expect(bridge.delete(traversalPath)).rejects.toThrow(/traversal/i);
  });

  test('rejects generated-prefixed paths that escape the generated subtree but stay in rootPath', async () => {
    // Defense-in-depth: `tina/__generated__/../../.env` resolves to
    // `<rootPath>/.env` — inside rootPath, but outside the generated subtree
    // the routing is supposed to expose. The new assertGeneratedSubtree check
    // catches this even though plain assertWithinBase would let it through.
    const escapePath = 'tina/__generated__/../../.env';
    const bridge = new FilesystemBridge(generatorDir, contentDir);
    await expect(bridge.put(escapePath, 'leak')).rejects.toThrow(/traversal/i);
    await expect(bridge.get(escapePath)).rejects.toThrow(/traversal/i);
    await expect(bridge.delete(escapePath)).rejects.toThrow(/traversal/i);
  });
});

describe('AuditFileSystemBridge', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `tinacms-audit-bridge-${Date.now()}`);
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
