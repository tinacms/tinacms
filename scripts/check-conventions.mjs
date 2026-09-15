#!/usr/bin/env node
/**
 * Checks two documented conventions that Biome 1.9.4 has no rule for, and that
 * this version cannot express as a plugin:
 *
 *   1. `AGENTS.md` — "Error narrowing is an `if`, not an expression."
 *   2. `packages/v4/AGENTS.md` — "Don't use `&&` for conditional rendering."
 *
 * Usage: node scripts/check-conventions.mjs [root]
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCOPE = [
  'packages/v4/@tinacms/tinacms/src',
  'packages/v4/@tinacms/rich-text/src',
  'packages/v4/@tinacms/ui/src',
];

// `pnpm dlx shadcn@latest add` and the Plate registry own these directories.
// The next update overwrites the files, so a person cannot keep a fix here and
// the check becomes noise that someone turns off. Hand-written files in the
// same directories stay in scope.
const VENDORED_DIRS = [
  'packages/v4/@tinacms/rich-text/src/plate/components/plate-ui',
  'packages/v4/@tinacms/ui/src/components',
];

const HAND_WRITTEN = new Set([
  'packages/v4/@tinacms/ui/src/components/field-wrapper.tsx',
]);

const SKIP_DIRS = new Set(['node_modules', 'dist', '__generated__']);

const isVendored = (relative) =>
  !HAND_WRITTEN.has(relative) &&
  VENDORED_DIRS.some((dir) => relative.startsWith(`${dir}/`));

const collect = (directory, files = []) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collect(full, files);
    } else if (/\.tsx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
};

const blank = (text) => text.replace(/[^\n]/g, ' ');

const withoutComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:\w'"`])\/\/[^\n]*/gm, (match, lead) =>
      lead === undefined ? blank(match) : lead + blank(match.slice(lead.length))
    );

const lineAt = (source, index) => {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source[i] === '\n') line += 1;
  }
  return line;
};

const startOfOperand = (source, index) => {
  let i = index;
  while (i > 0 && /\s/.test(source[i - 1])) i -= 1;
  while (i > 0 && /[\w$.\]?]/.test(source[i - 1])) i -= 1;
  return i;
};

const isStatementCondition = (source, operandStart) => {
  let i = operandStart;
  while (i > 0 && /[\s(!]/.test(source[i - 1])) i -= 1;
  const end = i;
  while (i > 0 && /[\w$]/.test(source[i - 1])) i -= 1;
  const keyword = source.slice(i, end);
  return keyword === 'if' || keyword === 'while';
};

const NARROWING = /\binstanceof\s+Error\b/g;

// `&&` can only be followed by `<` when the `<` opens a JSX element: `<` never
// starts an expression in a .tsx file.
const CONDITIONAL_JSX = /&&\s*(?:\(\s*)?<[A-Za-z>]/g;

export const scanSource = (relative, source) => {
  const code = withoutComments(source);
  const violations = [];

  for (const match of code.matchAll(NARROWING)) {
    if (isStatementCondition(code, startOfOperand(code, match.index))) continue;
    violations.push({
      file: relative,
      line: lineAt(code, match.index),
      rule: 'error-narrowing',
      message:
        '`instanceof Error` narrows in an expression — use an `if` statement',
    });
  }

  if (relative.endsWith('.tsx')) {
    for (const match of code.matchAll(CONDITIONAL_JSX)) {
      violations.push({
        file: relative,
        line: lineAt(code, match.index),
        rule: 'conditional-jsx',
        message:
          '`&&` renders a conditional element — use a ternary with an explicit `null`',
      });
    }
  }

  return violations;
};

export const scanRoot = (root) => {
  const violations = [];
  for (const scope of SCOPE) {
    const directory = path.join(root, scope);
    if (!existsSync(directory)) continue;
    for (const file of collect(directory)) {
      const relative = path.relative(root, file).split(path.sep).join('/');
      if (isVendored(relative)) continue;
      violations.push(...scanSource(relative, readFileSync(file, 'utf8')));
    }
  }
  return violations.sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line
  );
};

const main = () => {
  const root = path.resolve(
    process.argv[2] ?? path.join(fileURLToPath(import.meta.url), '../..')
  );
  const violations = scanRoot(root);
  for (const { file, line, rule, message } of violations) {
    process.stdout.write(`${file}:${line}  [${rule}] ${message}\n`);
  }
  if (violations.length > 0) {
    process.stdout.write(`\n${violations.length} convention violation(s).\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write('Conventions: no violations.\n');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
