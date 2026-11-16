import { describe, expect, it } from 'vitest';
import { createWriteLock } from './write-lock';

const gate = () => {
  let open: () => void = () => {};
  const opened = new Promise<void>((resolve) => {
    open = resolve;
  });
  return { opened, open };
};

describe('write lock', () => {
  it('runs saves together and holds a structural operation until they finish', async () => {
    const lock = createWriteLock();
    const log: string[] = [];
    const release = gate();
    const save = lock.shared(async () => {
      log.push('save start');
      await release.opened;
      log.push('save end');
    });
    const structural = lock.exclusive(async () => {
      log.push('structural');
    });
    const secondSave = lock.shared(async () => {
      log.push('second save');
    });
    await Promise.resolve();
    expect(log).toEqual(['save start']);
    release.open();
    await Promise.all([save, structural, secondSave]);
    expect(log).toEqual([
      'save start',
      'save end',
      'structural',
      'second save',
    ]);
  });

  it('releases the lock when an operation throws', async () => {
    const lock = createWriteLock();
    await expect(
      lock.exclusive(async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
    await expect(lock.shared(async () => 'ok')).resolves.toBe('ok');
  });
});
