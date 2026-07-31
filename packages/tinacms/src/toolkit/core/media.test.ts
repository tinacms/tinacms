import { EventBus } from './event';
import {
  Media,
  MediaManager,
  MediaRenameError,
  MediaStore,
  MediaUploadOptions,
} from './media';

const media = (filename: string, directory = 'products'): Media => ({
  type: 'file',
  id: filename,
  filename,
  directory,
  src: `/uploads/${directory}/${filename}`,
});

const buildStore = (overrides: Partial<MediaStore> = {}): MediaStore => ({
  accept: '*',
  async persist(_files: MediaUploadOptions[]) {
    return [];
  },
  async delete() {},
  async list() {
    return { items: [] };
  },
  ...overrides,
});

const buildManager = (store: MediaStore) => {
  const events = new EventBus();
  const seen: { type: string; [key: string]: any }[] = [];
  events.subscribe('*', (event) => seen.push(event));
  return { manager: new MediaManager(store, events), events, seen };
};

describe('MediaManager.rename', () => {
  it('delegates to the store and returns the new media', async () => {
    const renamed = media('new.jpg');
    const rename = vi.fn().mockResolvedValue(renamed);
    const { manager } = buildManager(buildStore({ rename }));

    const result = await manager.rename(
      'products/old.jpg',
      'products/new.jpg'
    );

    expect(rename).toHaveBeenCalledWith('products/old.jpg', 'products/new.jpg');
    expect(result).toBe(renamed);
  });

  it('dispatches start then success with the resolved media', async () => {
    const renamed = media('new.jpg');
    const { manager, seen } = buildManager(
      buildStore({ rename: vi.fn().mockResolvedValue(renamed) })
    );

    await manager.rename('products/old.jpg', 'products/new.jpg');

    expect(seen.map((e) => e.type)).toEqual([
      'media:rename:start',
      'media:rename:success',
    ]);
    expect(seen[0]).toMatchObject({
      from: 'products/old.jpg',
      to: 'products/new.jpg',
    });
    expect(seen[1]).toMatchObject({
      from: 'products/old.jpg',
      to: 'products/new.jpg',
      media: renamed,
    });
  });

  it('dispatches failure and rethrows when the store rejects', async () => {
    const error = new MediaRenameError({
      code: 'NAME_COLLISION',
      message: 'already exists',
    });
    const { manager, seen } = buildManager(
      buildStore({ rename: vi.fn().mockRejectedValue(error) })
    );

    await expect(
      manager.rename('products/old.jpg', 'products/new.jpg')
    ).rejects.toBe(error);

    expect(seen.map((e) => e.type)).toEqual([
      'media:rename:start',
      'media:rename:failure',
    ]);
    expect(seen[1]).toMatchObject({
      from: 'products/old.jpg',
      to: 'products/new.jpg',
      error,
    });
  });

  it('throws UNSUPPORTED without dispatching when the store cannot rename', async () => {
    const { manager, seen } = buildManager(buildStore());

    const error = await manager
      .rename('products/old.jpg', 'products/new.jpg')
      .catch((e) => e);

    expect(error).toBeInstanceOf(MediaRenameError);
    expect(error.code).toBe('UNSUPPORTED');
    expect(seen).toHaveLength(0);
  });
});
