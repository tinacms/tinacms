import { describe, expect, it } from 'vitest';
import snapshot from './__snapshots__/print-object-literal.txt?raw';
import { printObjectLiteral } from './print-object-literal';
import { MINIMUM_CORPUS, corpus } from './print-object-literal.corpus';
import { parseSnapshot } from './print-object-literal.snapshot';

/**
 * The snapshot holds what prettier 2.8.8, the implementation this printer
 * replaced, printed for every corpus case. Its output is written verbatim into
 * user content files, so the two must agree byte for byte. After changing the
 * corpus, run `pnpm --filter @tinacms/mdx snapshot:print-object-literal`.
 */
const records = parseSnapshot(snapshot);

describe('printObjectLiteral', () => {
  it('has a corpus large enough to be worth running', () => {
    expect(corpus.length).toBeGreaterThanOrEqual(MINIMUM_CORPUS);
  });

  it('has a snapshot record for every corpus case', () => {
    const stale: string[] = [];
    corpus.forEach(({ name, value }, index) => {
      const record = records[index];
      const current =
        record !== undefined &&
        record.index === index &&
        record.name === name.trimEnd() &&
        record.input === JSON.stringify(value);
      if (!current && stale.length < 5) {
        stale.push(`${index} ${name}`);
      }
    });
    expect(records.length).toBe(corpus.length);
    expect(stale).toEqual([]);
  });

  it('matches the recorded prettier output byte for byte', () => {
    const failures: string[] = [];
    let compared = 0;
    corpus.forEach(({ name, value }, index) => {
      const record = records[index];
      if (record === undefined) {
        return;
      }
      const actual = printObjectLiteral(value);
      compared++;
      if (actual !== record.expected && failures.length < 5) {
        failures.push(
          [
            `case: ${name}`,
            `input: ${record.input.slice(0, 300)}`,
            `prettier:\n${record.expected}`,
            `printer:\n${actual}`,
          ].join('\n')
        );
      }
    });
    expect(compared).toBe(corpus.length);
    expect(compared).toBeGreaterThanOrEqual(MINIMUM_CORPUS);
    expect(failures).toEqual([]);
  });

  it('normalises the value the way JSON.stringify did', () => {
    const value = {
      dropped: undefined,
      kept: 1,
      when: new Date(Date.UTC(2020, 0, 2, 3, 4, 5)),
      notANumber: Number.NaN,
      holes: [undefined, () => 1],
    };
    expect(printObjectLiteral(value)).toBe(
      [
        '{',
        '  kept: 1,',
        '  when: "2020-01-02T03:04:05.000Z",',
        '  notANumber: null,',
        '  holes: [null, null]',
        '}',
      ].join('\n')
    );
    expect(printObjectLiteral(value)).not.toContain('dropped');
  });
});
