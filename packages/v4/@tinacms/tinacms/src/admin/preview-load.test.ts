import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type LoadCondition,
  type ProbeResult,
  createPreviewLoad,
} from './preview-load';

const setup = (readable = true) => {
  const probes: ((result: ProbeResult) => void)[] = [];
  const seen: LoadCondition[] = [];
  const load = createPreviewLoad({
    probe: () =>
      new Promise<ProbeResult>((resolve) => {
        probes.push(resolve);
      }),
    frameReadable: () => readable,
    onCondition: (condition) => seen.push(condition),
  });
  const answer = async (result: ProbeResult) => {
    const next = probes.shift();
    if (!next) throw new Error('no probe is waiting');
    next(result);
    await vi.advanceTimersByTimeAsync(0);
  };
  return { load, seen, answer, probes };
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('createPreviewLoad', () => {
  it('shows the page once load and a reached probe have both settled, in either order', async () => {
    const a = setup();
    a.load.start('loading', 'http://x/');
    await a.answer('reached');
    expect(a.seen.at(-1)).toBe('loading');
    a.load.loaded();
    expect(a.seen.at(-1)).toBeUndefined();

    const b = setup();
    b.load.start('loading', 'http://x/');
    b.load.loaded();
    expect(b.seen.at(-1)).toBe('loading');
    await b.answer('reached');
    expect(b.seen.at(-1)).toBeUndefined();
  });

  it('counts a load that fires before the first start', async () => {
    const { load, seen, answer } = setup();
    load.loaded();
    load.start('loading', 'http://x/', true);
    await answer('reached');
    expect(seen.at(-1)).toBeUndefined();
  });

  it('a later start drops the load of the one before it', async () => {
    const { load, seen, answer } = setup();
    load.start('loading', 'http://x/');
    load.loaded();
    load.start('reloading', 'http://x/');
    await answer('reached');
    await answer('reached');
    expect(seen.at(-1)).toBe('reloading');
  });

  it('a rejected probe fails, whatever load did', async () => {
    const { load, seen, answer } = setup();
    load.start('loading', 'http://x/');
    load.loaded();
    await answer('rejected');
    expect(seen.at(-1)).toBe('failed');
  });

  it('a timed-out probe waits for load, probes again and shows the page', async () => {
    const { load, seen, answer } = setup();
    load.start('loading', 'http://x/');
    await answer('timeout');
    expect(seen.at(-1)).toBe('loading');
    load.loaded();
    await answer('reached');
    expect(seen.at(-1)).toBeUndefined();
  });

  it('a second timeout shows a readable frame and fails an unreadable one', async () => {
    const readable = setup(true);
    readable.load.start('loading', 'http://x/');
    readable.load.loaded();
    await readable.answer('timeout');
    await readable.answer('timeout');
    expect(readable.seen.at(-1)).toBeUndefined();

    const blocked = setup(false);
    blocked.load.start('loading', 'http://x/');
    blocked.load.loaded();
    await blocked.answer('timeout');
    await blocked.answer('timeout');
    expect(blocked.seen.at(-1)).toBe('failed');
  });

  it('fails at the cap with no load, and a late load shows the page', async () => {
    const { load, seen, answer } = setup();
    load.start('loading', 'http://x/');
    await answer('timeout');
    await vi.advanceTimersByTimeAsync(30_000);
    expect(seen.at(-1)).toBe('failed');
    load.loaded();
    await answer('reached');
    expect(seen.at(-1)).toBeUndefined();
  });

  it('a late load of the browser error page keeps the note', async () => {
    const { load, seen, answer } = setup(false);
    load.start('loading', 'http://x/');
    await answer('timeout');
    await vi.advanceTimersByTimeAsync(30_000);
    load.loaded();
    await answer('timeout');
    expect(seen.at(-1)).toBe('failed');
  });
});
