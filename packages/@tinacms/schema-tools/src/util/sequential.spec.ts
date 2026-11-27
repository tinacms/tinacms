import { sequential } from './sequential';

describe('sequential', () => {
  it('returns all results in order, including falsy values', async () => {
    const result = await sequential([1, 2, 3, 4], async (item) => item % 2);
    expect(result).toEqual([1, 0, 1, 0]);
  });

  it('keeps false, null and empty string results', async () => {
    const result = await sequential([1, 2, 3], async (item) => {
      if (item === 1) return false;
      if (item === 2) return null;
      return '';
    });
    expect(result).toEqual([false, null, '']);
  });

  it('passes the item index to the callback', async () => {
    const indexes: number[] = [];
    await sequential(['a', 'b', 'c'], async (_item, index) => {
      indexes.push(index);
      return index;
    });
    expect(indexes).toEqual([0, 1, 2]);
  });

  it('returns an empty array when items is undefined', async () => {
    expect(await sequential(undefined, async (item: string) => item)).toEqual([]);
  });
});
