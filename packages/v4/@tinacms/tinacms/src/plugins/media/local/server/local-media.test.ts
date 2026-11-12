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

  it('refuses a name that a file has, and leaves that file untouched', async () => {
    await media.save(fileOf('hero.jpg', 'first'), 'posts');
    await expect(
      media.save(fileOf('hero.jpg', 'second'), 'posts')
    ).rejects.toMatchObject({ code: 'name-taken' });
    expect(await fs.readFile(uploads('posts/hero.jpg'), 'utf8')).toBe('first');
    expect(await fs.readdir(uploads('posts'))).toEqual(['hero.jpg']);
  });

  it('refuses a name that a folder has', async () => {
    await fs.mkdir(uploads('shots.png'), { recursive: true });
    await expect(media.save(fileOf('shots.png'))).rejects.toMatchObject({
      code: 'name-taken',
    });
    expect((await fs.stat(uploads('shots.png'))).isDirectory()).toBe(true);
    expect(await fs.readdir(uploads())).toEqual(['shots.png']);
  });

  it('refuses a name that a symlink has, even a dangling one', async () => {
    await fs.mkdir(uploads(), { recursive: true });
    await fs.symlink(uploads('nowhere'), uploads('dangling.png'));
    await expect(media.save(fileOf('dangling.png'))).rejects.toMatchObject({
      code: 'name-taken',
    });
    await expect(fs.access(uploads('nowhere'))).rejects.toThrow();
    expect(await fs.readdir(uploads())).toEqual(['dangling.png']);
  });

  it('lets one of two saves of the same name win', async () => {
    const outcomes = await Promise.allSettled([
      media.save(fileOf('hero.jpg', 'one')),
      media.save(fileOf('hero.jpg', 'two')),
    ]);
    const won = outcomes.filter((outcome) => outcome.status === 'fulfilled');
    const lost = outcomes.filter((outcome) => outcome.status === 'rejected');
    expect(won).toHaveLength(1);
    expect(lost).toHaveLength(1);
    expect(lost[0]).toMatchObject({ reason: { code: 'name-taken' } });
    const winner = outcomes[0].status === 'fulfilled' ? 'one' : 'two';
    expect(await fs.readFile(uploads('hero.jpg'), 'utf8')).toBe(winner);
    expect(await fs.readdir(uploads())).toEqual(['hero.jpg']);
  });

  it('never lists a file before all its bytes are in place', async () => {
    const link = fs.link.bind(fs);
    let listedWhileWriting: unknown;
    let onDiskWhileWriting: string[] = [];
    const spy = vi.spyOn(fs, 'link').mockImplementation(async (from, to) => {
      listedWhileWriting = await media.list('');
      onDiskWhileWriting = await fs.readdir(uploads());
      return link(from, to);
    });
    await media.save(fileOf('hero.jpg'));
    spy.mockRestore();
    expect(listedWhileWriting).toEqual({ items: [] });
    expect(onDiskWhileWriting).toHaveLength(1);
    expect(onDiskWhileWriting[0].startsWith('.')).toBe(true);
    expect(await fs.readdir(uploads())).toEqual(['hero.jpg']);
  });

  it('leaves no file behind when the write fails, and tries no copy', async () => {
    const spy = vi
      .spyOn(fs, 'link')
      .mockRejectedValue(Object.assign(new Error('disk'), { code: 'EIO' }));
    const copy = vi.spyOn(fs, 'open');
    await expect(media.save(fileOf('hero.jpg'))).rejects.toThrow('disk');
    expect(copy).not.toHaveBeenCalled();
    spy.mockRestore();
    copy.mockRestore();
    expect(await fs.readdir(uploads())).toEqual([]);
  });
});

describe.each(['EPERM', 'ENOTSUP', 'EOPNOTSUPP', 'ENOSYS', 'EXDEV'])(
  'local media save when the link step fails with %s',
  (code) => {
    const fsError = (errorCode: string) =>
      Object.assign(new Error(errorCode), { code: errorCode });

    beforeEach(() => {
      vi.spyOn(fs, 'link').mockRejectedValue(fsError(code));
    });

    afterEach(() => vi.restoreAllMocks());

    it('stores the file under its name and returns its media path', async () => {
      expect(await media.save(fileOf('hero.jpg', 'jpeg'), 'posts')).toBe(
        'posts/hero.jpg'
      );
      expect(await fs.readFile(uploads('posts/hero.jpg'), 'utf8')).toBe('jpeg');
      expect(await fs.readdir(uploads('posts'))).toEqual(['hero.jpg']);
    });

    it('refuses a name that a file has, and leaves that file untouched', async () => {
      await fs.mkdir(uploads(), { recursive: true });
      await fs.writeFile(uploads('hero.jpg'), 'first');
      await expect(
        media.save(fileOf('hero.jpg', 'second'))
      ).rejects.toMatchObject({ code: 'name-taken' });
      expect(await fs.readFile(uploads('hero.jpg'), 'utf8')).toBe('first');
      expect(await fs.readdir(uploads())).toEqual(['hero.jpg']);
    });

    it('lets one of two saves of the same name win', async () => {
      const outcomes = await Promise.allSettled([
        media.save(fileOf('hero.jpg', 'one')),
        media.save(fileOf('hero.jpg', 'two')),
      ]);
      const lost = outcomes.filter((outcome) => outcome.status === 'rejected');
      expect(lost).toHaveLength(1);
      expect(lost[0]).toMatchObject({ reason: { code: 'name-taken' } });
      const winner = outcomes[0].status === 'fulfilled' ? 'one' : 'two';
      expect(await fs.readFile(uploads('hero.jpg'), 'utf8')).toBe(winner);
      expect(await fs.readdir(uploads())).toEqual(['hero.jpg']);
    });

    it('leaves no file under the name when the copy fails part way', async () => {
      const open = fs.open.bind(fs);
      vi.spyOn(fs, 'open').mockImplementation(async (...args) => {
        const handle = await open(...args);
        const write = handle.writeFile.bind(handle);
        handle.writeFile = async () => {
          await write('half');
          throw fsError('ENOSPC');
        };
        return handle;
      });
      await expect(media.save(fileOf('hero.jpg'))).rejects.toThrow('ENOSPC');
      expect(await fs.readdir(uploads())).toEqual([]);
    });

    it('leaves the file that has the name in place when the copy is refused', async () => {
      await fs.mkdir(uploads(), { recursive: true });
      vi.spyOn(fs, 'open').mockImplementation(async (target) => {
        await fs.writeFile(String(target), 'theirs');
        throw fsError('EEXIST');
      });
      await expect(media.save(fileOf('hero.jpg'))).rejects.toMatchObject({
        code: 'name-taken',
      });
      expect(await fs.readFile(uploads('hero.jpg'), 'utf8')).toBe('theirs');
      expect(await fs.readdir(uploads())).toEqual(['hero.jpg']);
    });

    it('leaves a file that another upload stored in place when the copy fails before it makes its own', async () => {
      await fs.mkdir(uploads(), { recursive: true });
      vi.spyOn(fs, 'open').mockImplementation(async (target) => {
        await fs.writeFile(String(target), 'theirs');
        throw fsError('EACCES');
      });
      await expect(media.save(fileOf('hero.jpg'))).rejects.toThrow('EACCES');
      expect(await fs.readFile(uploads('hero.jpg'), 'utf8')).toBe('theirs');
      expect(await fs.readdir(uploads())).toEqual(['hero.jpg']);
    });
  }
);

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
    await fs.mkdir(uploads('shots.png'), { recursive: true });
    await expect(media.rename('a.png', 'shots.png')).rejects.toMatchObject({
      code: 'name-taken',
    });
  });

  it('refuses a target that is a symlink, even a dangling one', async () => {
    await seed('a.png');
    await fs.symlink(uploads('nowhere'), uploads('dangling.png'));
    await expect(media.rename('a.png', 'dangling.png')).rejects.toMatchObject({
      code: 'name-taken',
    });
    expect((await fs.lstat(uploads('dangling.png'))).isSymbolicLink()).toBe(
      true
    );
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

describe('the file types local media stores', () => {
  const typed = (name: string, type: string, text = 'bytes') =>
    new File([text], name, { type });

  it.each(['hero.jpg', 'HERO.PNG', 'notes.txt'])('stores %s', async (name) => {
    expect(await media.save(typed(name, ''), 'posts')).toBe(`posts/${name}`);
    expect(await fs.readdir(uploads('posts'))).toEqual([name]);
  });

  it.each([
    'tool.exe',
    'notes.docx',
    'page.html',
    'README',
    '.png',
    'hero.png.',
    'hero.png ',
    'photo.png.zip',
    'photo.png?v=2.zip',
    'a.constructor',
    'a.__proto__',
    'a.toString',
  ])(
    'refuses "%s" as unsupported and makes no file or folder',
    async (name) => {
      await expect(
        media.save(typed(name, 'image/png'), 'posts')
      ).rejects.toMatchObject({ code: 'unsupported' });
      await expect(fs.access(uploads())).rejects.toThrow();
    }
  );

  it('does not read the type the request reports', async () => {
    await expect(
      media.save(typed('tool.exe', 'image/png'))
    ).rejects.toMatchObject({ code: 'unsupported' });
    expect(await media.save(typed('a.png', ''))).toBe('a.png');
    expect(await media.save(typed('b.png', 'application/octet-stream'))).toBe(
      'b.png'
    );
  });

  it('keeps the codes of the name check and of a taken name', async () => {
    await expect(
      media.save(typed('posts\\tool.exe', 'image/png'))
    ).rejects.toMatchObject({ code: 'invalid-name' });
    await media.save(typed('hero.png', 'image/png', 'first'));
    await expect(
      media.save(typed('hero.png', 'image/png', 'second'))
    ).rejects.toMatchObject({ code: 'name-taken' });
    expect(await fs.readFile(uploads('hero.png'), 'utf8')).toBe('first');
  });

  describe('on rename', () => {
    beforeEach(async () => {
      await media.save(typed('a.png', 'image/png', 'one'));
      await fs.mkdir(uploads('posts'), { recursive: true });
    });

    it.each(['posts/a.png', 'b.png', 'b.PNG'])(
      'moves a.png to %s',
      async (target) => {
        expect(await media.rename('a.png', target)).toBe(target);
        expect(await fs.readFile(uploads(target), 'utf8')).toBe('one');
      }
    );

    it.each(['a.txt', 'a.html', 'a', 'a.png.zip'])(
      'refuses a.png to %s as unsupported and leaves the source in place',
      async (target) => {
        await expect(media.rename('a.png', target)).rejects.toMatchObject({
          code: 'unsupported',
        });
        expect(await fs.readFile(uploads('a.png'), 'utf8')).toBe('one');
        expect((await fs.readdir(uploads())).sort()).toEqual([
          'a.png',
          'posts',
        ]);
      }
    );

    it('still lists, moves, renames and deletes a stored file of another type', async () => {
      await fs.writeFile(uploads('old.docx'), 'doc');
      expect((await media.list('')).items).toContainEqual({
        path: 'old.docx',
        kind: 'file',
      });
      expect(await media.rename('old.docx', 'posts/old.docx')).toBe(
        'posts/old.docx'
      );
      expect(await media.rename('posts/old.docx', 'posts/new.docx')).toBe(
        'posts/new.docx'
      );
      await media.delete('posts/new.docx');
      expect(await fs.readdir(uploads('posts'))).toEqual([]);
    });

    it('keeps the code of a target outside the media folder', async () => {
      await expect(media.rename('a.png', '../a.txt')).rejects.toMatchObject({
        code: 'invalid-path',
      });
    });
  });
});
