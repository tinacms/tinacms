import { describe, expect, it } from 'vitest';
import { getHourCycle } from './date-format';

describe('getHourCycle', () => {
  it.each(['HH:mm', 'H:mm', 'kk:mm', 'YYYY-MM-DD HH:mm'])(
    'returns 24 for %s',
    (timeFormat) => {
      expect(getHourCycle(timeFormat)).toBe(24);
    }
  );

  it.each(['h:mm A', 'hh:mm a', 'mm:ss'])('returns 12 for %s', (timeFormat) => {
    expect(getHourCycle(timeFormat)).toBe(12);
  });

  it('ignores letters inside [escaped] text', () => {
    expect(getHourCycle('h:mm A [Hrs]')).toBe(12);
  });

  it('returns 12 without a time format', () => {
    expect(getHourCycle(undefined)).toBe(12);
  });
});
