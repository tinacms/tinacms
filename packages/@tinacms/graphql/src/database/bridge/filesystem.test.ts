import fs from 'fs-extra';
import path from 'path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { FilesystemBridge } from './filesystem';

describe('FilesystemBridge', () => {
  let root: string;
  let bridge: FilesystemBridge;

  beforeEach(async () => {
    root = path.join(
      process.env.TMPDIR || '/tmp',
      `tinacms-fs-bridge-${Date.now()}`
    );
    await fs.ensureDir(path.join(root, 'content/posts'));
    await fs.writeFile(
      path.join(root, 'content/posts/hello.md'),
      '# Hello'
    );
    bridge = new FilesystemBridge(root);
  });

  afterEach(async () => {
    await fs.remove(root);
  });

  describe('path traversal rejection', () => {
    test('get rejects backslash traversal', () => {
      expect(() => bridge.get('x\\..\\..\\..\\etc\\passwd')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    test('get rejects null bytes', () => {
      expect(() => bridge.get('content/posts/file\0.md')).rejects.toThrow(
        'null bytes'
      );
    });

    test('put rejects backslash traversal', () => {
      expect(() =>
        bridge.put('x\\..\\..\\..\\etc\\malicious', 'payload')
      ).rejects.toThrow('Path traversal detected');
    });

    test('put rejects null bytes', () => {
      expect(() =>
        bridge.put('content/posts/file\0.md', 'payload')
      ).rejects.toThrow('null bytes');
    });

    test('delete rejects backslash traversal', () => {
      expect(() =>
        bridge.delete('x\\..\\..\\..\\outside.txt')
      ).rejects.toThrow('Path traversal detected');
    });

    test('delete rejects null bytes', () => {
      expect(() => bridge.delete('content/posts/file\0.md')).rejects.toThrow(
        'null bytes'
      );
    });

    test('glob rejects backslash traversal', () => {
      expect(() => bridge.glob('x\\..\\..\\..', '.md')).rejects.toThrow(
        'Path traversal detected'
      );
    });

    test('glob rejects null bytes', () => {
      expect(() =>
        bridge.glob('content/posts\0', '.md')
      ).rejects.toThrow('null bytes');
    });
  });
});
