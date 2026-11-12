import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    await expect(media.list('../..')).rejects.toMatchObject({
      code: 'invalid-path',
    });
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
    await expect(
      media.save(fileOf('x.png'), '../../src')
    ).rejects.toMatchObject({ code: 'invalid-path' });
  });

  it.each(['../x.png', 'a/b.png', 'a\\b.png', '..', ''])(
    'rejects the file name %j',
    async (name) => {
      const file = Object.defineProperty(fileOf('x.png'), 'name', {
        value: name,
      });
      await expect(media.save(file)).rejects.toMatchObject({
        code: 'invalid-name',
      });
    }
  );

  it('rejects a folder that links outside the media root', async () => {
    const outside = path.join(rootDir, 'outside');
    await fs.mkdir(outside);
    await fs.mkdir(uploads(), { recursive: true });
    await fs.symlink(outside, uploads('linked'));
    await expect(media.save(fileOf('x.png'), 'linked')).rejects.toMatchObject({
      code: 'invalid-path',
    });
    expect(await fs.readdir(outside)).toEqual([]);
  });

  it('rejects a null byte', async () => {
    await expect(media.save(fileOf('x.png'), 'a\0b')).rejects.toMatchObject({
      code: 'invalid-path',
    });
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
    await expect(media.delete('posts')).rejects.toMatchObject({
      code: 'unsupported',
    });
  });

  it('refuses to delete the media root itself', async () => {
    await fs.mkdir(uploads(), { recursive: true });
    await expect(media.delete('.')).rejects.toMatchObject({
      code: 'invalid-path',
    });
  });

  it('reports a file that does not exist as not-found', async () => {
    await expect(media.delete('missing.png')).rejects.toMatchObject({
      code: 'not-found',
    });
  });

  it('refuses a file outside the media root', async () => {
    await fs.writeFile(path.join(rootDir, 'secret.txt'), '');
    await expect(media.delete('../../secret.txt')).rejects.toMatchObject({
      code: 'invalid-path',
    });
  });
});

describe('local media rename', () => {
  const seed = async (name: string, text = 'bytes') => {
    await media.save(fileOf(name, text));
  };

  it('moves a file into another folder and returns the new path', async () => {
    await seed('a.png', 'one');
    await fs.mkdir(uploads('posts'), { recursive: true });
    expect(await media.rename('a.png', 'posts/b.png')).toBe('posts/b.png');
    expect(await fs.readFile(uploads('posts/b.png'), 'utf8')).toBe('one');
    await expect(fs.access(uploads('a.png'))).rejects.toThrow();
  });

  it('reports a missing source as not-found', async () => {
    await fs.mkdir(uploads(), { recursive: true });
    await expect(media.rename('missing.png', 'b.png')).rejects.toMatchObject({
      code: 'not-found',
    });
  });

  it('reports a missing target folder as not-found and creates none', async () => {
    await seed('a.png');
    await expect(media.rename('a.png', 'new/b.png')).rejects.toMatchObject({
      code: 'not-found',
    });
    await expect(fs.access(uploads('new'))).rejects.toThrow();
    expect(await fs.readFile(uploads('a.png'), 'utf8')).toBe('bytes');
  });

  it('refuses to move a folder', async () => {
    await fs.mkdir(uploads('posts'), { recursive: true });
    await expect(media.rename('posts', 'other')).rejects.toMatchObject({
      code: 'unsupported',
    });
  });

  it('refuses to move a symlink', async () => {
    await seed('a.png');
    await fs.symlink(uploads('a.png'), uploads('link.png'));
    await expect(media.rename('link.png', 'b.png')).rejects.toMatchObject({
      code: 'unsupported',
    });
  });

  it('refuses a target file name that save would refuse', async () => {
    await seed('a.png');
    await expect(media.rename('a.png', 'a\\b.png')).rejects.toMatchObject({
      code: 'invalid-name',
    });
    await expect(fs.access(uploads('a.png'))).resolves.toBeUndefined();
  });

  it('refuses a target that is a file, and leaves it untouched', async () => {
    await seed('a.png', 'one');
    await seed('b.png', 'two');
    await expect(media.rename('a.png', 'b.png')).rejects.toMatchObject({
      code: 'name-taken',
    });
    expect(await fs.readFile(uploads('b.png'), 'utf8')).toBe('two');
    expect(await fs.readFile(uploads('a.png'), 'utf8')).toBe('one');
  });

  it('refuses a target that is a folder', async () => {
    await seed('a.png');
    await fs.mkdir(uploads('posts'), { recursive: true });
    await expect(media.rename('a.png', 'posts')).rejects.toMatchObject({
      code: 'name-taken',
    });
  });

  it('refuses a target that is a symlink, even a dangling one', async () => {
    await seed('a.png');
    await fs.symlink(uploads('nowhere'), uploads('dangling'));
    await expect(media.rename('a.png', 'dangling')).rejects.toMatchObject({
      code: 'name-taken',
    });
    expect((await fs.lstat(uploads('dangling'))).isSymbolicLink()).toBe(true);
  });

  it('refuses a target that appears after the checks', async () => {
    await seed('a.png', 'one');
    const link = fs.link.bind(fs);
    const spy = vi.spyOn(fs, 'link').mockImplementation(async (from, to) => {
      await fs.writeFile(to, 'raced');
      return link(from, to);
    });
    await expect(media.rename('a.png', 'b.png')).rejects.toMatchObject({
      code: 'name-taken',
    });
    spy.mockRestore();
    expect(await fs.readFile(uploads('b.png'), 'utf8')).toBe('raced');
    expect(await fs.readFile(uploads('a.png'), 'utf8')).toBe('one');
  });

  it.each(['../../secret.txt', '/etc/passwd', '%2e%2e/%2e%2e/secret.txt'])(
    'refuses the path %j as source and as target',
    async (outside) => {
      await seed('a.png');
      await fs.writeFile(path.join(rootDir, 'secret.txt'), 'secret');
      const source = outside.startsWith('%')
        ? decodeURIComponent(outside)
        : outside;
      await expect(media.rename(source, 'b.png')).rejects.toMatchObject({
        code: 'invalid-path',
      });
      await expect(media.rename('a.png', source)).rejects.toMatchObject({
        code: 'invalid-path',
      });
    }
  );

  it('refuses a source or target inside a symlinked folder', async () => {
    await seed('a.png');
    const outside = path.join(rootDir, 'outside');
    await fs.mkdir(outside);
    await fs.writeFile(path.join(outside, 'x.png'), 'x');
    await fs.symlink(outside, uploads('linked'));
    await expect(media.rename('linked/x.png', 'b.png')).rejects.toMatchObject({
      code: 'invalid-path',
    });
    await expect(media.rename('a.png', 'linked/b.png')).rejects.toMatchObject({
      code: 'invalid-path',
    });
    await expect(fs.access(path.join(outside, 'b.png'))).rejects.toThrow();
  });
});
