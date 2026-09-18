#!/usr/bin/env node
/**
 * Records what prettier prints for every case in `print-object-literal.corpus.ts`
 * into `src/stringify/__snapshots__/print-object-literal.txt`. Run it after
 * changing the corpus: `pnpm --filter @tinacms/mdx snapshot:print-object-literal`.
 *
 * prettier 2.8.8 is the implementation `printObjectLiteral` replaced, so the
 * pin must not move. It is no longer a devDependency; install it for the run
 * and remove it again afterwards, as the error below spells out.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { corpus } from '../src/stringify/print-object-literal.corpus.ts';
import { formatSnapshot } from '../src/stringify/print-object-literal.snapshot.ts';

const ORACLE_VERSION = '2.8.8';
const INSTALL = `pnpm add -D prettier@${ORACLE_VERSION} --filter @tinacms/mdx`;
const REGENERATE = 'pnpm --filter @tinacms/mdx snapshot:print-object-literal';
const REMOVE = 'pnpm remove prettier --filter @tinacms/mdx';
const DUMMY_FUNC = 'const dummyFunc = ';

const here = dirname(fileURLToPath(import.meta.url));
const snapshotPath = resolve(
  here,
  '../src/stringify/__snapshots__/print-object-literal.txt'
);

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const loadOracle = async () => {
  let prettier;
  let parser;
  try {
    ({ default: prettier } = await import('prettier/esm/standalone.mjs'));
    ({ default: parser } = await import('prettier/esm/parser-espree.mjs'));
  } catch (error) {
    if (error instanceof Error && error.code === 'ERR_MODULE_NOT_FOUND') {
      fail(
        [
          `prettier ${ORACLE_VERSION} is not installed. Install it, regenerate, then remove it again:`,
          `  ${INSTALL}`,
          `  ${REGENERATE}`,
          `  ${REMOVE}`,
        ].join('\n')
      );
    }
    throw error;
  }
  if (prettier.version !== ORACLE_VERSION) {
    fail(
      `prettier ${prettier.version} is installed, but the oracle must be ${ORACLE_VERSION}:\n  ${INSTALL}`
    );
  }
  return (value) =>
    prettier
      .format(`${DUMMY_FUNC}${JSON.stringify(value)}`, {
        parser: 'acorn',
        trailingComma: 'none',
        semi: false,
        plugins: [parser],
      })
      .trim()
      .replace(DUMMY_FUNC, '');
};

const oracle = await loadOracle();
const records = corpus.map(({ name, value }, index) => ({
  index,
  name,
  input: JSON.stringify(value),
  expected: oracle(value),
}));

await mkdir(dirname(snapshotPath), { recursive: true });
await writeFile(snapshotPath, formatSnapshot(records), 'utf8');
console.log(`Recorded ${records.length} cases to ${snapshotPath}`);
