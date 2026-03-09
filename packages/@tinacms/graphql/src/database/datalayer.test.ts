import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryLevel } from 'memory-level';
import {
  coerceFilterChainOperands,
  DEFAULT_COLLECTION_SORT_KEY,
  makeFilter,
  makeFilterChain,
  makeFilterSuffixes,
  makeIndexOpsForDocument,
  OP,
  type BinaryFilter,
  type IndexDefinition,
  type TernaryFilter,
} from './datalayer';
import { INDEX_KEY_FIELD_SEPARATOR, LevelProxy, SUBLEVEL_OPTIONS } from './level';
import type { Level } from './level';

// ─── Helpers ───────────────────────────────────────────────────────────────

const binary = (
  pathExpression: string,
  type: string,
  operator: OP,
  rightOperand: any,
  list = false
): BinaryFilter => ({ pathExpression, type, operator, rightOperand, list });

const ternary = (
  pathExpression: string,
  type: string,
  leftOperator: OP.GTE | OP.GT,
  leftOperand: any,
  rightOperator: OP.LTE | OP.LT,
  rightOperand: any,
  list = false
): TernaryFilter => ({
  pathExpression,
  type,
  leftOperator,
  leftOperand,
  rightOperator,
  rightOperand,
  list,
});

const singleFieldIndex = (name: string, type = 'string'): IndexDefinition => ({
  fields: [{ name, type, list: false }],
});

// ─── makeFilter ─────────────────────────────────────────────────────────────

describe('makeFilter', () => {
  describe('string type', () => {
    it.each([
      ['eq — match', OP.EQ, 'hello', { name: 'hello' }, true],
      ['eq — miss', OP.EQ, 'hello', { name: 'world' }, false],
      ['gt — match', OP.GT, 'b', { name: 'c' }, true],
      ['gt — miss (equal)', OP.GT, 'b', { name: 'b' }, false],
      ['gt — miss (less)', OP.GT, 'b', { name: 'a' }, false],
      ['gte — match (equal)', OP.GTE, 'b', { name: 'b' }, true],
      ['gte — match (greater)', OP.GTE, 'b', { name: 'c' }, true],
      ['gte — miss', OP.GTE, 'b', { name: 'a' }, false],
      ['lt — match', OP.LT, 'b', { name: 'a' }, true],
      ['lt — miss (equal)', OP.LT, 'b', { name: 'b' }, false],
      ['lte — match (equal)', OP.LTE, 'b', { name: 'b' }, true],
      ['lte — match (less)', OP.LTE, 'b', { name: 'a' }, true],
      ['startsWith — match', OP.STARTS_WITH, 'hel', { name: 'hello' }, true],
      ['startsWith — miss', OP.STARTS_WITH, 'hel', { name: 'world' }, false],
      ['in — match', OP.IN, ['a', 'b'], { name: 'a' }, true],
      ['in — miss', OP.IN, ['a', 'b'], { name: 'c' }, false],
    ] as const)('%s', (_, operator, rightOperand, data, expected) => {
      const fn = makeFilter({ filterChain: [binary('name', 'string', operator, rightOperand)] });
      expect(fn(data)).toBe(expected);
    });
  });

  describe('number type', () => {
    it.each([
      ['eq — match', OP.EQ, 5, { score: 5 }, true],
      ['eq — miss', OP.EQ, 5, { score: 6 }, false],
      ['gt — match', OP.GT, 5, { score: 6 }, true],
      ['gt — miss', OP.GT, 5, { score: 5 }, false],
      ['gte — equal', OP.GTE, 5, { score: 5 }, true],
      ['lt — match', OP.LT, 5, { score: 4 }, true],
      ['lte — equal', OP.LTE, 5, { score: 5 }, true],
      ['in — match', OP.IN, [1, 2, 3], { score: 2 }, true],
      ['in — miss', OP.IN, [1, 2, 3], { score: 4 }, false],
    ] as const)('%s', (_, operator, rightOperand, data, expected) => {
      const fn = makeFilter({ filterChain: [binary('score', 'number', operator, rightOperand)] });
      expect(fn(data)).toBe(expected);
    });
  });

  describe('boolean type', () => {
    it.each([
      ['true eq true', OP.EQ, true, { active: true }, true],
      ['true eq false', OP.EQ, true, { active: false }, false],
      ['false eq false', OP.EQ, false, { active: false }, true],
      ['string "true" coerces to true', OP.EQ, true, { active: 'true' }, true],
      ['string "1" coerces to true', OP.EQ, true, { active: '1' }, true],
      ['string "false" coerces to boolean false (matches false operand)', OP.EQ, false, { active: 'false' }, true],
    ] as const)('%s', (_, operator, rightOperand, data, expected) => {
      const fn = makeFilter({ filterChain: [binary('active', 'boolean', operator, rightOperand)] });
      expect(fn(data)).toBe(expected);
    });
  });

  describe('datetime type', () => {
    const d = (iso: string) => new Date(iso).getTime();

    it.each([
      ['eq — match', OP.EQ, d('2023-01-15'), { ts: new Date('2023-01-15').toISOString() }, true],
      ['eq — miss', OP.EQ, d('2023-01-15'), { ts: new Date('2023-01-16').toISOString() }, false],
      ['gt — match', OP.GT, d('2023-01-15'), { ts: new Date('2023-01-16').toISOString() }, true],
      ['gt — miss', OP.GT, d('2023-01-15'), { ts: new Date('2023-01-14').toISOString() }, false],
      ['lt — match', OP.LT, d('2023-01-15'), { ts: new Date('2023-01-14').toISOString() }, true],
      ['lt — miss', OP.LT, d('2023-01-15'), { ts: new Date('2023-01-16').toISOString() }, false],
    ] as const)('%s', (_, operator, rightOperand, data, expected) => {
      const fn = makeFilter({ filterChain: [binary('ts', 'datetime', operator, rightOperand)] });
      expect(fn(data)).toBe(expected);
    });
  });

  describe('reference type', () => {
    it('eq — match', () => {
      const fn = makeFilter({
        filterChain: [binary('author', 'reference', OP.EQ, 'content/authors/alice.md')],
      });
      expect(fn({ author: 'content/authors/alice.md' })).toBe(true);
      expect(fn({ author: 'content/authors/bob.md' })).toBe(false);
    });
  });

  describe('list field', () => {
    it('eq matches if any list item equals the operand', () => {
      const fn = makeFilter({
        filterChain: [{ ...binary('tags', 'string', OP.EQ, 'news'), list: true }],
      });
      expect(fn({ tags: ['sports', 'news', 'tech'] })).toBe(true);
      expect(fn({ tags: ['sports', 'tech'] })).toBe(false);
    });

    it('startsWith matches if any list item starts with the operand', () => {
      const fn = makeFilter({
        filterChain: [{ ...binary('tags', 'string', OP.STARTS_WITH, 'new'), list: true }],
      });
      expect(fn({ tags: ['news', 'tech'] })).toBe(true);
      expect(fn({ tags: ['sports', 'tech'] })).toBe(false);
    });

    it('datetime list: eq matches if any list item equals the operand (ISO string coerced)', () => {
      const epoch = new Date('2023-06-15').getTime();
      const fn = makeFilter({
        filterChain: [{ ...binary('dates', 'datetime', OP.EQ, epoch), list: true }],
      });
      expect(fn({ dates: ['2023-01-01', '2023-06-15'] })).toBe(true);
      expect(fn({ dates: ['2023-01-01', '2023-12-31'] })).toBe(false);
    });

    it('boolean list: eq matches if any list item coerces to the operand', () => {
      const fn = makeFilter({
        filterChain: [{ ...binary('flags', 'boolean', OP.EQ, true), list: true }],
      });
      expect(fn({ flags: [false, 'true', false] })).toBe(true);
      expect(fn({ flags: [false, '0', false] })).toBe(false);
    });
  });

  describe('TernaryFilter (range)', () => {
    it('matches a value within inclusive range', () => {
      const fn = makeFilter({
        filterChain: [ternary('score', 'number', OP.GTE, 3, OP.LTE, 7)],
      });
      expect(fn({ score: 3 })).toBe(true);
      expect(fn({ score: 5 })).toBe(true);
      expect(fn({ score: 7 })).toBe(true);
      expect(fn({ score: 2 })).toBe(false);
      expect(fn({ score: 8 })).toBe(false);
    });

    it('respects strict bounds with gt/lt', () => {
      const fn = makeFilter({
        filterChain: [ternary('score', 'number', OP.GT, 3, OP.LT, 7)],
      });
      expect(fn({ score: 4 })).toBe(true);
      expect(fn({ score: 3 })).toBe(false);
      expect(fn({ score: 7 })).toBe(false);
    });

    it('list: matches if any list item satisfies the range', () => {
      const fn = makeFilter({
        filterChain: [{ ...ternary('scores', 'number', OP.GTE, 3, OP.LTE, 7), list: true }],
      });
      expect(fn({ scores: [1, 5, 10] })).toBe(true);
      expect(fn({ scores: [1, 2, 10] })).toBe(false);
    });
  });

  describe('compound filters (AND semantics)', () => {
    it('requires all conditions to be satisfied', () => {
      const fn = makeFilter({
        filterChain: [
          binary('name', 'string', OP.EQ, 'Alice'),
          binary('score', 'number', OP.GT, 18),
        ],
      });
      expect(fn({ name: 'Alice', score: 25 })).toBe(true);
      expect(fn({ name: 'Alice', score: 10 })).toBe(false);
      expect(fn({ name: 'Bob', score: 25 })).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('empty filterChain passes every record (no-op)', () => {
      const fn = makeFilter({ filterChain: [] });
      expect(fn({})).toBe(true);
      expect(fn({ anything: 'here' })).toBe(true);
    });

    it('returns false when field is absent from the record', () => {
      const fn = makeFilter({ filterChain: [binary('name', 'string', OP.EQ, 'hello')] });
      expect(fn({})).toBe(false);
    });

    it('throws on an unknown data type', () => {
      const fn = makeFilter({ filterChain: [binary('x', 'unknown' as any, OP.EQ, 'v')] });
      expect(() => fn({ x: 'v' })).toThrow();
    });
  });
});

// ─── makeFilterChain ─────────────────────────────────────────────────────────

describe('makeFilterChain', () => {
  it('returns empty array for empty conditions', () => {
    expect(makeFilterChain({ conditions: [] })).toEqual([]);
  });

  it('returns empty array when conditions is falsy', () => {
    expect(makeFilterChain({ conditions: null as any })).toEqual([]);
  });

  it('builds a BinaryFilter from a single eq condition', () => {
    const chain = makeFilterChain({
      conditions: [
        { filterPath: 'title', filterExpression: { _type: 'string', _list: false, eq: 'foo' } },
      ],
    });
    expect(chain).toHaveLength(1);
    const filter = chain[0] as BinaryFilter;
    expect(filter.pathExpression).toBe('title');
    expect(filter.operator).toBe(OP.EQ);
    expect(filter.rightOperand).toBe('foo');
    expect(filter.type).toBe('string');
    expect(filter.list).toBe(false);
    expect(filter.pad).toBeUndefined();
  });

  it('maps "after" to OP.GT', () => {
    const [f] = makeFilterChain({
      conditions: [
        { filterPath: 'date', filterExpression: { _type: 'datetime', _list: false, after: '2023-01-01' } },
      ],
    }) as BinaryFilter[];
    expect(f.operator).toBe(OP.GT);
  });

  it('maps "before" to OP.LT', () => {
    const [f] = makeFilterChain({
      conditions: [
        { filterPath: 'date', filterExpression: { _type: 'datetime', _list: false, before: '2023-01-01' } },
      ],
    }) as BinaryFilter[];
    expect(f.operator).toBe(OP.LT);
  });

  it('attaches padding for number fields', () => {
    const [f] = makeFilterChain({
      conditions: [
        { filterPath: 'score', filterExpression: { _type: 'number', _list: false, eq: 42 } },
      ],
    }) as BinaryFilter[];
    expect(f.pad).toEqual({ fillString: '0', maxLength: 4 });
  });

  it('builds a TernaryFilter from gt+lt pair', () => {
    const chain = makeFilterChain({
      conditions: [
        { filterPath: 'score', filterExpression: { _type: 'number', _list: false, gt: 3, lt: 10 } },
      ],
    });
    expect(chain).toHaveLength(1);
    const filter = chain[0] as TernaryFilter;
    expect(filter.leftOperator).toBe(OP.GT);
    expect(filter.leftOperand).toBe(3);
    expect(filter.rightOperator).toBe(OP.LT);
    expect(filter.rightOperand).toBe(10);
  });

  it('accumulates multiple conditions', () => {
    const chain = makeFilterChain({
      conditions: [
        { filterPath: 'title', filterExpression: { _type: 'string', _list: false, startsWith: 'Hello' } },
        { filterPath: 'score', filterExpression: { _type: 'number', _list: false, gt: 5 } },
      ],
    });
    expect(chain).toHaveLength(2);
  });

  it('throws for an invalid operator', () => {
    expect(() =>
      makeFilterChain({
        conditions: [
          { filterPath: 'title', filterExpression: { _type: 'string', _list: false, badOp: 'foo' } as any },
        ],
      })
    ).toThrow();
  });

  it('throws for an unsupported two-key combination (e.g. eq+in)', () => {
    expect(() =>
      makeFilterChain({
        conditions: [
          { filterPath: 'score', filterExpression: { _type: 'number', _list: false, eq: 1, in: [1, 2] } as any },
        ],
      })
    ).toThrow();
  });
});

// ─── makeFilterSuffixes ──────────────────────────────────────────────────────

describe('makeFilterSuffixes', () => {
  const idx = singleFieldIndex('title');

  it('returns {} for an empty filter chain', () => {
    expect(makeFilterSuffixes([], idx)).toEqual({});
  });

  it('returns {} for a null/undefined filter chain', () => {
    expect(makeFilterSuffixes(null as any, idx)).toEqual({});
  });

  it('sets both left and right for EQ', () => {
    const result = makeFilterSuffixes([binary('title', 'string', OP.EQ, 'foo')], idx);
    expect(result).toEqual({ left: 'foo', right: 'foo' });
  });

  it('sets only left for GT', () => {
    const result = makeFilterSuffixes([binary('title', 'string', OP.GT, 'foo')], idx);
    expect(result).toEqual({ left: 'foo', right: undefined });
  });

  it('sets only left for GTE', () => {
    const result = makeFilterSuffixes([binary('title', 'string', OP.GTE, 'foo')], idx);
    expect(result).toEqual({ left: 'foo', right: undefined });
  });

  it('sets only right for LT', () => {
    const result = makeFilterSuffixes([binary('title', 'string', OP.LT, 'foo')], idx);
    expect(result).toEqual({ left: undefined, right: 'foo' });
  });

  it('sets only right for LTE', () => {
    const result = makeFilterSuffixes([binary('title', 'string', OP.LTE, 'foo')], idx);
    expect(result).toEqual({ left: undefined, right: 'foo' });
  });

  it('returns undefined for IN operator (not indexable)', () => {
    const result = makeFilterSuffixes([binary('title', 'string', OP.IN, ['a', 'b'])], idx);
    expect(result).toBeUndefined();
  });

  it('returns undefined when filter path is not in the index', () => {
    const result = makeFilterSuffixes([binary('other', 'string', OP.EQ, 'foo')], idx);
    expect(result).toBeUndefined();
  });

  it('applies number padding when pad is set', () => {
    const numIdx = singleFieldIndex('score', 'number');
    const filter: BinaryFilter = {
      ...binary('score', 'number', OP.EQ, 42),
      pad: { fillString: '0', maxLength: 4 },
    };
    const result = makeFilterSuffixes([filter], numIdx);
    expect(result).toEqual({ left: '0042', right: '0042' });
  });

  describe('TernaryFilter on single-field index', () => {
    it('sets both left and right from operands', () => {
      const filter = ternary('title', 'string', OP.GTE, 'aaa', OP.LTE, 'zzz');
      const result = makeFilterSuffixes([filter], idx);
      expect(result).toEqual({ left: 'aaa', right: 'zzz' });
    });
  });

  describe('compound index (two fields)', () => {
    const twoFieldIdx: IndexDefinition = {
      fields: [
        { name: 'category', type: 'string', list: false },
        { name: 'title', type: 'string', list: false },
      ],
    };

    it('builds compound left/right when lower-order field uses EQ', () => {
      const result = makeFilterSuffixes(
        [
          binary('category', 'string', OP.EQ, 'tech'),
          binary('title', 'string', OP.STARTS_WITH, 'Intro'),
        ],
        twoFieldIdx
      );
      expect(result?.left).toBe(`tech${INDEX_KEY_FIELD_SEPARATOR}Intro`);
      expect(result?.right).toBe(`tech${INDEX_KEY_FIELD_SEPARATOR}Intro`);
    });

    it('returns undefined when lower-order field uses non-EQ operator', () => {
      const result = makeFilterSuffixes(
        [
          binary('category', 'string', OP.GT, 'tech'),
          binary('title', 'string', OP.EQ, 'foo'),
        ],
        twoFieldIdx
      );
      expect(result).toBeUndefined();
    });

    it('returns undefined when there is a gap (higher-order field filtered but lower-order is not)', () => {
      // Filtering only on "title" (second field) without constraining "category" (first field)
      // is not a valid index scan — the compound prefix is incomplete.
      const result = makeFilterSuffixes(
        [binary('title', 'string', OP.EQ, 'foo')],
        twoFieldIdx
      );
      expect(result).toBeUndefined();
    });
  });
});

// ─── makeIndexOpsForDocument ─────────────────────────────────────────────────

describe('makeIndexOpsForDocument', () => {
  let level: Level;

  // A fresh MemoryLevel wrapped in LevelProxy for each test
  beforeEach(() => {
    level = new LevelProxy(
      new MemoryLevel<string, Record<string, any>>({ valueEncoding: 'json' }) as any
    ) as unknown as Level;
  });

  const indexDefs: Record<string, IndexDefinition> = {
    [DEFAULT_COLLECTION_SORT_KEY]: { fields: [] },
    title: { fields: [{ name: 'title', type: 'string', list: false }] },
  };

  it('returns [] when collection is undefined', () => {
    const ops = makeIndexOpsForDocument('posts/hello.md', undefined, indexDefs, { title: 'Hi' }, 'put', level);
    expect(ops).toEqual([]);
  });

  it('produces a put op for the default sort key using the filepath as key', () => {
    const ops = makeIndexOpsForDocument('posts/hello.md', 'post', indexDefs, { title: 'Hi' }, 'put', level);
    const defaultOp = ops.find((op) => op.key === 'posts/hello.md');
    expect(defaultOp).toBeDefined();
    expect(defaultOp!.type).toBe('put');
    expect((defaultOp as any).value).toEqual({});
  });

  it('produces a put op for a custom sort key with indexed value + filepath', () => {
    const ops = makeIndexOpsForDocument('posts/hello.md', 'post', indexDefs, { title: 'Greetings' }, 'put', level);
    const titleOp = ops.find((op) => op.key.includes('Greetings'));
    expect(titleOp).toBeDefined();
    expect(titleOp!.key).toBe(`Greetings${INDEX_KEY_FIELD_SEPARATOR}posts/hello.md`);
    expect(titleOp!.type).toBe('put');
  });

  it('skips custom sort key when indexed field is missing from data', () => {
    const ops = makeIndexOpsForDocument('posts/hello.md', 'post', indexDefs, {} as any, 'put', level);
    // Only the default sort key op should exist
    const titleOps = ops.filter((op) => op.key.includes(INDEX_KEY_FIELD_SEPARATOR));
    expect(titleOps).toHaveLength(0);
  });

  it('produces del ops with undefined value and same keys as the equivalent put ops', () => {
    const data = { title: 'Hi' };
    const putOps = makeIndexOpsForDocument('posts/hello.md', 'post', indexDefs, data, 'put', level);
    const delOps = makeIndexOpsForDocument('posts/hello.md', 'post', indexDefs, data, 'del', level);

    expect(delOps).toHaveLength(putOps.length);
    for (let i = 0; i < delOps.length; i++) {
      expect(delOps[i].type).toBe('del');
      expect((delOps[i] as any).value).toBeUndefined();
      // Keys must match exactly so that del removes what put wrote
      expect(delOps[i].key).toBe(putOps[i].key);
    }
  });
});

// ─── coerceFilterChainOperands ───────────────────────────────────────────────

describe('coerceFilterChainOperands', () => {
  it('returns [] for an empty input', () => {
    expect(coerceFilterChainOperands([])).toEqual([]);
  });

  it('converts datetime string operand to epoch number', () => {
    const iso = '2023-06-15T00:00:00.000Z';
    const [f] = coerceFilterChainOperands([binary('ts', 'datetime', OP.EQ, iso)]) as BinaryFilter[];
    expect(f.rightOperand).toBe(new Date(iso).getTime());
  });

  it('converts datetime array operand elements to epoch numbers', () => {
    const dates = ['2023-01-01', '2023-06-01'];
    const [f] = coerceFilterChainOperands([
      { ...binary('ts', 'datetime', OP.IN, dates) },
    ]) as BinaryFilter[];
    expect(f.rightOperand).toEqual(dates.map((d) => new Date(d).getTime()));
  });

  it('converts both operands of a datetime TernaryFilter', () => {
    const filter = ternary('ts', 'datetime', OP.GTE, '2023-01-01', OP.LTE, '2023-12-31');
    const [f] = coerceFilterChainOperands([filter]) as TernaryFilter[];
    expect(f.leftOperand).toBe(new Date('2023-01-01').getTime());
    expect(f.rightOperand).toBe(new Date('2023-12-31').getTime());
  });

  it('passes through non-datetime types unchanged', () => {
    const input = binary('score', 'number', OP.GT, 42);
    const [f] = coerceFilterChainOperands([input]) as BinaryFilter[];
    expect(f.rightOperand).toBe(42);
  });

  it('applies stringEscaper to string operands containing the index separator', () => {
    // The separator char must be percent-encoded so it cannot collide with index keys
    const separator = INDEX_KEY_FIELD_SEPARATOR;
    const [f] = coerceFilterChainOperands([
      binary('title', 'string', OP.EQ, `hello${separator}world`),
    ]) as BinaryFilter[];
    expect(f.rightOperand).toBe(`hello${encodeURIComponent(separator)}world`);
  });

  it('escapes the index separator in BOTH operands of a string TernaryFilter', () => {
    // When a string filter is a range (TernaryFilter), both leftOperand and
    // rightOperand must be escaped — only rightOperand is escaped for BinaryFilters.
    const separator = INDEX_KEY_FIELD_SEPARATOR;
    const input = ternary(
      'title',
      'string',
      OP.GTE,
      `a${separator}start`,
      OP.LTE,
      `z${separator}end`
    );
    const [f] = coerceFilterChainOperands([input]) as TernaryFilter[];
    expect(f.leftOperand).toBe(`a${encodeURIComponent(separator)}start`);
    expect(f.rightOperand).toBe(`z${encodeURIComponent(separator)}end`);
  });
});
