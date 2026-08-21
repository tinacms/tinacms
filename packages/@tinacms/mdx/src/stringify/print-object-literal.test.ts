// @ts-ignore Fix this by updating prettier
import parser from 'prettier/esm/parser-espree.mjs';
// @ts-ignore Fix this by updating prettier
import prettier from 'prettier/esm/standalone.mjs';
import { describe, expect, it } from 'vitest';
import { printObjectLiteral } from './print-object-literal';

/**
 * prettier is kept as a devDependency purely to act as the oracle here: it is
 * the implementation `printObjectLiteral` replaced, and its output is written
 * verbatim into user content files, so the two must agree byte for byte.
 */
const DUMMY_FUNC = 'const dummyFunc = ';
const oracle = (value: unknown) =>
  prettier
    .format(`${DUMMY_FUNC}${JSON.stringify(value)}`, {
      parser: 'acorn',
      trailingComma: 'none',
      semi: false,
      plugins: [parser],
    })
    .trim()
    .replace(DUMMY_FUNC, '');

type Case = { name: string; value: unknown };

const pad = (length: number, character = 'x') => character.repeat(length);

const nest = (depth: number, value: unknown): unknown =>
  depth === 0 ? value : nest(depth - 1, { wrap: value });

/** Sweeps the 80-column boundary at several indentation depths. */
const widthSweep = (): Case[] => {
  const cases: Case[] = [];
  for (const depth of [0, 1, 2]) {
    for (const keyLength of [1, 3, 4, 5, 9, 20]) {
      const key = `k${pad(keyLength - 1, 'e')}`;
      for (let valueLength = 0; valueLength <= 84; valueLength++) {
        cases.push({
          name: `width depth=${depth} key=${keyLength} value=${valueLength}`,
          value: nest(depth, { [key]: pad(valueLength) }),
        });
      }
    }
  }
  return cases;
};

/** Sweeps the same boundary for non-string values, which pick other layouts. */
const layoutSweep = (): Case[] => {
  const cases: Case[] = [];
  const values: [string, unknown][] = [
    ['null', null],
    ['true', true],
    ['negative', -12345],
    ['positive', 12345],
    ['object', { a: 1 }],
    ['array', [1, 2]],
    ['emptyObject', {}],
    ['emptyArray', []],
    ['string', 'value'],
  ];
  for (const depth of [0, 1, 2, 3]) {
    for (const [label, value] of values) {
      for (let keyLength = 1; keyLength <= 74; keyLength++) {
        cases.push({
          name: `layout ${label} depth=${depth} key=${keyLength}`,
          value: nest(depth, { [`k${pad(keyLength - 1, 'e')}`]: value }),
        });
      }
    }
  }
  return cases;
};

/** `fill` layout: arrays whose every element is a number print concisely. */
const numericArraySweep = (): Case[] => {
  const cases: Case[] = [];
  const pools: [string, number[]][] = [
    ['small', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ['wide', [1234567, -98765432, 1e21, 1.5, -0.25, 1e-7]],
    ['mixed', [1, 22, 333, 4444, 55555, 666666, 7777777, 88888888]],
  ];
  for (const [label, pool] of pools) {
    for (let length = 0; length <= 40; length++) {
      const elements = Array.from(
        { length },
        (_, index) => pool[index % pool.length] as number
      );
      cases.push({ name: `fill ${label} n=${length}`, value: elements });
      cases.push({
        name: `fill ${label} nested n=${length}`,
        value: { rows: elements },
      });
      cases.push({
        name: `fill ${label} deep n=${length}`,
        value: nest(2, { rows: elements }),
      });
    }
  }
  return cases;
};

/** `shouldBreak`: sibling containers that each hold more than one item. */
const breakPropagationCases = (): Case[] => {
  const cases: Case[] = [];
  const containers: unknown[] = [{ a: 1, b: 2 }, { a: 1 }, [1, 2], [1], {}, []];
  for (let i = 0; i < containers.length; i++) {
    for (let j = 0; j < containers.length; j++) {
      cases.push({
        name: `shouldBreak ${i}/${j}`,
        value: [containers[i], containers[j]],
      });
      cases.push({
        name: `shouldBreak triple ${i}/${j}`,
        value: [containers[i], containers[j], containers[i]],
      });
      cases.push({
        name: `shouldBreak nested ${i}/${j}`,
        value: { list: [containers[i], containers[j]] },
      });
    }
  }
  return cases;
};

const KEYS = [
  '',
  'a',
  'id',
  'title',
  'value',
  'isHeader',
  'backgroundColor',
  'not-an-ident',
  'with space',
  '0',
  '1',
  '22',
  '01',
  '1.5',
  '1.50',
  '-1',
  '1e3',
  '999999999999999999999',
  '0.0000001',
  'class',
  'null',
  'true',
  'constructor',
  '__proto__',
  '$x',
  '_y',
  'é',
  'über',
  '日本語',
  '𝐀',
  'a\tb',
  'quote"key',
  "apostrophe'key",
  '\\slash',
  'ß',
  'ᵃ',
  'ՠ',
  'ׯ',
  'ࡠ',
];

const STRINGS = [
  '',
  'hello',
  '# Hello\n',
  '100%',
  '#BFDBFE',
  "it's",
  'he said "hi"',
  `both " and '`,
  `''"`,
  `"'`,
  `""'`,
  'a\tb',
  'multi\nline\nstring',
  pad(30),
  pad(70),
  pad(200),
  'https://example.com/a/b?c=1&d=2',
  '\\backslash\\',
  'éè',
  '</div>',
  '  ',
  '\0',
  '\u007f\u009f',
  '😀 emoji',
  '👩‍👩‍👦‍👦 family',
  '日本語のテキストです',
  '한국어 텍스트',
  'é combining',
  '𝐀𝐁𝐂 astral',
  '   separators',
  '\ud800 lone surrogate',
  'ends with backslash \\',
  'tab\tandvertical',
];

const NUMBERS = [
  0,
  -0,
  1,
  -1,
  1.5,
  -1.5,
  1e21,
  -1e21,
  1e-7,
  1e100,
  5e-324,
  123456789,
  0.1,
  3.14159265358979,
  2147483647,
  Number.MAX_SAFE_INTEGER,
  1000000,
  100.5,
  0.000001,
  1e-21,
  2 ** 64,
  1e308,
];

/** Every key against every scalar, so key/value interactions are exhaustive. */
const scalarMatrix = (): Case[] => {
  const cases: Case[] = [];
  for (const key of KEYS) {
    for (const value of STRINGS) {
      cases.push({ name: `scalar ${key}`, value: { [key]: value } });
    }
    for (const value of NUMBERS) {
      cases.push({ name: `number ${key}`, value: { [key]: value } });
    }
    cases.push({ name: `misc ${key}`, value: { [key]: [1, 2, 3] } });
    cases.push({ name: `misc obj ${key}`, value: { [key]: { nested: true } } });
  }
  for (const value of NUMBERS) {
    cases.push({ name: 'bare number array', value: [value, value, value] });
  }
  for (const value of STRINGS) {
    cases.push({ name: 'bare string array', value: [value, value] });
  }
  return cases;
};

const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const randomCases = (count: number): Case[] => {
  const random = mulberry32(0x7a1acbb5);
  const pick = <T>(items: T[]): T =>
    items[Math.floor(random() * items.length)] as T;
  const build = (depth: number): unknown => {
    const roll = random();
    if (depth <= 0 || roll < 0.3) {
      const scalar = random();
      if (scalar < 0.4) return pick(STRINGS);
      if (scalar < 0.7) return pick(NUMBERS);
      if (scalar < 0.85) return random() < 0.5;
      return null;
    }
    if (roll < 0.5) {
      const length = Math.floor(random() * 30);
      return Array.from({ length }, () => pick(NUMBERS));
    }
    if (roll < 0.72) {
      const length = Math.floor(random() * 6);
      return Array.from({ length }, () => build(depth - 1));
    }
    const length = Math.floor(random() * 6);
    const object: Record<string, unknown> = {};
    for (let i = 0; i < length; i++) {
      object[pick(KEYS) + (random() < 0.3 ? i : '')] = build(depth - 1);
    }
    return object;
  };
  const cases: Case[] = [];
  for (let i = 0; i < count; i++) {
    const value = build(4);
    if (typeof value !== 'object' || value === null) continue;
    cases.push({ name: `random ${i}`, value });
  }
  return cases;
};

const REGRESSIONS: Case[] = [
  { name: 'empty object', value: {} },
  { name: 'empty array', value: [] },
  { name: 'array of empties', value: [[], {}] },
  {
    name: 'table-like field',
    value: [
      { celss: ['Three', 'Two', 'One'], isHeader: true },
      { celss: ['C', 'B', 'A'] },
    ],
  },
  { name: 'markdown column', value: [{ columns: [{ content: '# Hello\n' }] }] },
  { name: 'colour', value: { backgroundColor: '#BFDBFE' } },
  {
    name: 'numeric keys',
    value: { '0': 1, '00': 2, '1.0': 3, '1.5': 4, '-1': 5, '1e3': 6 },
  },
  { name: 'long single value', value: { a: pad(80) } },
  {
    name: 'wide key sequence',
    value: { key: Array.from({ length: 30 }, (_, i) => i) },
  },
];

/**
 * The same boundary sweep for content prettier does not measure one column per
 * code unit: wide scripts, combining marks, emoji clusters and C1 escapes.
 */
const nonAsciiWidthSweep = (): Case[] => {
  const cases: Case[] = [];
  const prefixes: [string, string][] = [
    ['fullwidth', '日本語のテキスト'],
    ['hangul', '한국어'],
    ['combining', 'e\u0301e\u0301e\u0301'],
    ['emoji', '😀😀😀'],
    ['zwj', '👩‍👩‍👦‍👦'],
    ['astral', '𝐀𝐁𝐂'],
    ['c1', '\u009b31m'],
    ['c1-mixed', '\u009b31mred\u009b0m'],
  ];
  for (const [label, prefix] of prefixes) {
    for (let valueLength = 0; valueLength <= 84; valueLength++) {
      cases.push({
        name: `non-ascii ${label} value=${valueLength}`,
        value: { key: prefix + pad(valueLength) },
      });
      cases.push({
        name: `non-ascii ${label} sibling value=${valueLength}`,
        value: { key: prefix + pad(valueLength), after: [1, 2] },
      });
    }
  }
  return cases;
};

const corpus: Case[] = [
  ...REGRESSIONS,
  ...widthSweep(),
  ...nonAsciiWidthSweep(),
  ...layoutSweep(),
  ...numericArraySweep(),
  ...breakPropagationCases(),
  ...scalarMatrix(),
  ...randomCases(800),
];

const MINIMUM_CORPUS = 5000;

describe('printObjectLiteral', () => {
  it('has a corpus large enough to be worth running', () => {
    expect(corpus.length).toBeGreaterThanOrEqual(MINIMUM_CORPUS);
  });

  it('matches prettier byte for byte', () => {
    const failures: string[] = [];
    let compared = 0;
    for (const { name, value } of corpus) {
      const expected = oracle(value);
      const actual = printObjectLiteral(value);
      compared++;
      if (actual !== expected) {
        if (failures.length < 5) {
          failures.push(
            [
              `case: ${name}`,
              `input: ${JSON.stringify(value)?.slice(0, 300)}`,
              `prettier:\n${expected}`,
              `printer:\n${actual}`,
            ].join('\n')
          );
        }
      }
    }
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
    expect(printObjectLiteral(value)).toBe(oracle(value));
    expect(printObjectLiteral(value)).not.toContain('dropped');
  });
});
