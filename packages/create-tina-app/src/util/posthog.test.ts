import { describe, expect, it, vi } from 'vitest';
import { system } from 'systeminformation';
import { getAnonymousUserId } from './posthog';

vi.mock('systeminformation', () => ({ system: vi.fn() }));

const reportUuid = (uuid: string) =>
  vi
    .mocked(system)
    .mockResolvedValue({ uuid } as Awaited<ReturnType<typeof system>>);

describe('getAnonymousUserId', () => {
  it('returns the same hashed id for the same machine', async () => {
    reportUuid('4c4c4544-0042-4410-8051-b4c04f4e3332');
    const first = await getAnonymousUserId();
    const second = await getAnonymousUserId();

    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(first).not.toContain('4c4c4544');
  });

  it.each(['', '-'])(
    'falls back to a random id when the uuid is %j',
    async (uuid) => {
      reportUuid(uuid);
      const first = await getAnonymousUserId();
      const second = await getAnonymousUserId();

      expect(first).toMatch(/^fallback-/);
      expect(first).not.toBe(second);
    }
  );

  it('falls back to a random id when systeminformation throws', async () => {
    vi.mocked(system).mockRejectedValue(new Error('dmidecode missing'));

    expect(await getAnonymousUserId()).toMatch(/^fallback-/);
  });
});
