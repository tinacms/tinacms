#!/usr/bin/env node
/**
 * Copies a curated subset of `@tinacms/mdx` test fixtures into
 * `src/__tests__/fixtures/`. Run on demand (`pnpm sync-fixtures`); the
 * resulting JSON files are committed so CI tests stay hermetic.
 *
 * Source AST shapes are the canonical Plate output the parser emits, so
 * pulling them straight from the parser's test corpus keeps the renderer
 * in lockstep with whatever the editor actually produces.
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const mdxTests = resolve(here, '../../mdx/src/next/tests');
const outDir = resolve(here, '../src/__tests__/fixtures');

const fixtures = [
  ['markdown-basic-kitchen-sink', 'basic-kitchen-sink.json'],
  ['markdown-basic-marks', 'leaf-marks.json'],
  ['markdown-basic-code-block', 'code-block.json'],
  ['markdown-shortcodes-inline', 'mdx-jsx-text.json'],
  ['markdown-shortcodes-rich-text-children', 'mdx-jsx-flow.json'],
];

await mkdir(outDir, { recursive: true });

for (const [dir, target] of fixtures) {
  const src = resolve(mdxTests, dir, 'node.json');
  const dst = resolve(outDir, target);
  await copyFile(src, dst);
  console.log(`✓ ${dir}/node.json → ${target}`);
}

console.log(`\nSynced ${fixtures.length} fixtures to ${outDir}`);
