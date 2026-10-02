import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLocalMedia, type LocalMedia } from './local-media';

let rootDir: string;
let media: LocalMedia;

const fileOf = (name: string, text = 'bytes') =>
  new File([text], name, { type: 'image/png' });

const uploads = (...segments: string[]) =>
  path.join(rootDir, 'public/uploads', ...segments);

beforeEach(async () => {
  rootDir = await fs.mkdtemp(path.join(tmpdir(), 'tina-media-'));
  media = createLocalMedia({ rootDir, publicFolder: 'public' });
});

afterEach(async () => {
  await fs.rm(rootDir, { recursive: true, force: true });
});

describe('local media list', () => {
  it('lists nothing before the media folder exists', async () => {
    expect(await media.list('')).toEqual({ items: [] });
  });

  it('lists folders first, then files, and hides dotfiles', async () => {
    await fs.mkdir(uploads('posts'), { recursive: true });
    await fs.writeFile(uploads('b.png'), '');
    await fs.writeFile(uploads('a.png'), '');
    await fs.writeFile(uploads('.gitkeep'), '');
    expect(await media.list('')).toEqual({
      items: [
        { path: 'posts', kind: 'directory' },
        { path: 'a.png', kind: 'file' },
        { path: 'b.png', kind: 'file' },
      ],
    });
  });

  it('lists a sub-folder with paths relative to the media root', async () => {
    await fs.mkdir(uploads('posts'), { recursive: true });
    await fs.writeFile(uploads('posts/hero.jpg'), '');
    expect(await media.list('posts')).toEqual({
      items: [{ path: 'posts/hero.jpg', kind: 'file' }],
    });
  });

  it('pages with a cursor', async () => {
    await fs.mkdir(uploads(), { recursive: true });
    for (const name of ['a.png', 'b.png', 'c.png']) {
      await fs.writeFile(uploads(name), '');
    }
    const first = await media.list('', { limit: 2 });
    expect(first.items.map((item) => item.path)).toEqual(['a.png', 'b.png']);
    const second = await media.list('', { limit: 2, cursor: first.cursor });
    expect(second).toEqual({ items: [{ path: 'c.png', kind: 'file' }] });
  });

  it('rejects a folder outside the media root', async () => {
    await expect(media.list('../..')).rejects.toThrow(
      /media-path-outside-root/
    );
  });
});

describe('local media save', () => {
  it('writes the file and returns its media path', async () => {
    expect(await media.save(fileOf('hero.jpg', 'jpeg'), 'posts')).toBe(
      'posts/hero.jpg'
    );
    expect(await fs.readFile(uploads('posts/hero.jpg'), 'utf8')).toBe('jpeg');
  });

  it('saves to the media root when no folder is given', async () => {
    expect(await media.save(fileOf('logo.svg'))).toBe('logo.svg');
  });

  it('rejects a folder that climbs out of the media root', async () => {
    await expect(media.save(fileOf('x.png'), '../../src')).rejects.toThrow(
      /media-path-outside-root/
    );
  });

  it.each(['../x.png', 'a/b.png', 'a\\b.png', '..', ''])(
    'rejects the file name %j',
    async (name) => {
      const file = Object.defineProperty(fileOf('x.png'), 'name', {
        value: name,
      });
      await expect(media.save(file)).rejects.toThrow(/media-file-name-invalid/);
    }
  );

  it('rejects a folder that links outside the media root', async () => {
    const outside = path.join(rootDir, 'outside');
    await fs.mkdir(outside);
    await fs.mkdir(uploads(), { recursive: true });
    await fs.symlink(outside, uploads('linked'));
    await expect(media.save(fileOf('x.png'), 'linked')).rejects.toThrow(
      /media-path-outside-root/
    );
    expect(await fs.readdir(outside)).toEqual([]);
  });

  it('rejects a null byte', async () => {
    await expect(media.save(fileOf('x.png'), 'a\0b')).rejects.toThrow(
      /media-path-null-byte/
    );
  });
});

describe('local media delete', () => {
  it('deletes a file', async () => {
    await media.save(fileOf('old.png'));
    await media.delete('old.png');
    expect(await media.list('')).toEqual({ items: [] });
  });

  it('refuses to delete a folder', async () => {
    await fs.mkdir(uploads('posts'), { recursive: true });
    await expect(media.delete('posts')).rejects.toThrow(
      /media-delete-not-file/
    );
  });

  it('refuses to delete the media root itself', async () => {
    await fs.mkdir(uploads(), { recursive: true });
    await expect(media.delete('.')).rejects.toThrow(/media-path-outside-root/);
  });

  it('refuses a file outside the media root', async () => {
    await fs.writeFile(path.join(rootDir, 'secret.txt'), '');
    await expect(media.delete('../../secret.txt')).rejects.toThrow(
      /media-path-outside-root/
    );
  });
});
