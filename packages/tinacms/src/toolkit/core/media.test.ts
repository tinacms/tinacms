import { EventBus } from './event';
import { MediaManager, MediaStore } from './media';

const cancelledError = () =>
  Object.assign(new Error('Media operation cancelled.'), {
    name: 'MediaOperationCancelledError',
    code: 'MEDIA_OPERATION_CANCELLED',
  });

const buildManager = () => {
  const store: MediaStore = {
    accept: '*',
    persist: vi.fn().mockRejectedValue(cancelledError()),
    delete: vi.fn().mockRejectedValue(cancelledError()),
    list: vi.fn().mockResolvedValue({ items: [], nextOffset: 0 }),
  };
  const events = new EventBus();
  const manager = new MediaManager(store, events);
  return { events, manager };
};

describe('MediaManager', () => {
  it('does not dispatch an upload failure for a cancelled media workflow', async () => {
    const { events, manager } = buildManager();
    const onFailure = vi.fn();
    events.subscribe('media:upload:failure', onFailure);

    await expect(
      manager.persist([
        {
          directory: 'uploads',
          file: new File(['x'], 'a.png', { type: 'image/png' }),
        },
      ])
    ).rejects.toMatchObject({ code: 'MEDIA_OPERATION_CANCELLED' });

    expect(onFailure).not.toHaveBeenCalled();
  });

  it('does not dispatch a delete failure for a cancelled media workflow', async () => {
    const { events, manager } = buildManager();
    const onFailure = vi.fn();
    events.subscribe('media:delete:failure', onFailure);

    await expect(
      manager.delete({
        id: 'a.png',
        type: 'file',
        directory: 'uploads',
        filename: 'a.png',
      })
    ).rejects.toMatchObject({ code: 'MEDIA_OPERATION_CANCELLED' });

    expect(onFailure).not.toHaveBeenCalled();
  });
});
