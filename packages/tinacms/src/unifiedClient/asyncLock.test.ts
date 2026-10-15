import { describe, expect, it } from 'vitest';
import { AsyncLock } from './asyncLock';

const tick = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

describe('AsyncLock', () => {
  it('serializes overlapping acquires for the same key in FIFO order', async () => {
    const lock = new AsyncLock();
    const order: string[] = [];
    const gate = (() => {
      let resolve: () => void;
      const blocked = new Promise<void>((r) => (resolve = r));
      return { blocked, release: () => resolve() };
    })();

    const first = lock.acquire('key', async () => {
      order.push('first:start');
      await gate.blocked;
      order.push('first:end');
    });
    const second = lock.acquire('key', async () => {
      order.push('second:start');
      order.push('second:end');
    });

    await tick(10);
    expect(order).toEqual(['first:start']);
    gate.release();
    await Promise.all([first, second]);
    expect(order).toEqual([
      'first:start',
      'first:end',
      'second:start',
      'second:end',
    ]);
  });

  it('runs independent keys concurrently', async () => {
    const lock = new AsyncLock();
    let running = 0;
    let maxRunning = 0;

    await Promise.all(
      ['a', 'b', 'c'].map((key) =>
        lock.acquire(key, async () => {
          running += 1;
          maxRunning = Math.max(maxRunning, running);
          await tick(10);
          running -= 1;
        })
      )
    );

    expect(maxRunning).toBe(3);
  });

  it('propagates a rejection to the caller without wedging the queue', async () => {
    const lock = new AsyncLock();

    await expect(
      lock.acquire('key', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    await expect(lock.acquire('key', async () => 42)).resolves.toBe(42);
  });

  it('resolves with the value returned by the acquired fn', async () => {
    const lock = new AsyncLock();
    await expect(lock.acquire('key', async () => 'value')).resolves.toBe(
      'value'
    );
  });
});
