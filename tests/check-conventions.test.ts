import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'check-conventions.mjs');

const IN_SCOPE = 'packages/v4/@tinacms/tinacms/src';
const VENDORED = 'packages/v4/@tinacms/rich-text/src/plate/components/plate-ui';
const HAND_WRITTEN = 'packages/v4/@tinacms/ui/src/components/field-wrapper.tsx';

const temporaryRoots: string[] = [];

const check = (files: Record<string, string>) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tina-conventions-'));
  temporaryRoots.push(root);
  for (const [relative, source] of Object.entries(files)) {
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, source);
  }
  const result = spawnSync(process.execPath, [SCRIPT, root], {
    encoding: 'utf8',
  });
  return { status: result.status, stdout: result.stdout };
};

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe('error narrowing', () => {
  it('rejects a ternary that narrows a caught value', () => {
    const { status, stdout } = check({
      [`${IN_SCOPE}/a.ts`]: [
        'export const report = (cause: unknown) => {',
        '  return cause instanceof Error ? cause.message : String(cause);',
        '};',
        '',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain(`${IN_SCOPE}/a.ts:2  [error-narrowing]`);
  });

  it('rejects a logical-and chain that narrows a caught value', () => {
    const { status, stdout } = check({
      [`${IN_SCOPE}/b.ts`]: [
        'export const missing = (cause: unknown): boolean =>',
        "  cause instanceof Error && 'code' in cause;",
        '',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain(`${IN_SCOPE}/b.ts:2  [error-narrowing]`);
  });

  it('accepts narrowing written as an if statement', () => {
    const { status, stdout } = check({
      [`${IN_SCOPE}/c.ts`]: [
        'export const report = (cause: unknown) => {',
        '  if (cause instanceof Error) {',
        '    return cause.message;',
        '  }',
        '  return String(cause);',
        '};',
        '',
        'export const missing = (cause: unknown): boolean => {',
        '  if (!(cause instanceof Error)) return false;',
        "  return 'code' in cause;",
        '};',
        '',
      ].join('\n'),
    });
    expect(status).toBe(0);
    expect(stdout).toContain('no violations');
  });

  it('ignores a narrowing inside a comment', () => {
    const { status } = check({
      [`${IN_SCOPE}/d.ts`]: [
        '// cause instanceof Error ? cause.message : String(cause)',
        'export const value = 1;',
        '',
      ].join('\n'),
    });
    expect(status).toBe(0);
  });

  it('ignores a narrowing on an error class that is not Error', () => {
    const { status } = check({
      [`${IN_SCOPE}/e.ts`]: [
        'declare class ErrorLike {}',
        'export const is = (cause: unknown) =>',
        '  cause instanceof ErrorLike ? 1 : 0;',
        '',
      ].join('\n'),
    });
    expect(status).toBe(0);
  });
});

describe('conditional JSX', () => {
  it('rejects an element rendered through logical and', () => {
    const { status, stdout } = check({
      [`${IN_SCOPE}/f.tsx`]: [
        'export const F = ({ label }: { label?: string }) => (',
        '  <div>{label && <span>{label}</span>}</div>',
        ');',
        '',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain(`${IN_SCOPE}/f.tsx:2  [conditional-jsx]`);
  });

  it('rejects an element rendered through logical and across lines', () => {
    const { status, stdout } = check({
      [`${IN_SCOPE}/g.tsx`]: [
        'export const G = ({ items }: { items: string[] }) => (',
        '  <div>',
        '    {items.length > 0 && (',
        '      <span>{items.length}</span>',
        '    )}',
        '  </div>',
        ');',
        '',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain(`${IN_SCOPE}/g.tsx:3  [conditional-jsx]`);
  });

  it('accepts a ternary with an explicit null', () => {
    const { status, stdout } = check({
      [`${IN_SCOPE}/h.tsx`]: [
        'export const H = ({ label }: { label?: string }) => (',
        '  <div>{label ? <span>{label}</span> : null}</div>',
        ');',
        '',
      ].join('\n'),
    });
    expect(status).toBe(0);
    expect(stdout).toContain('no violations');
  });

  it('accepts logical and between values that are not elements', () => {
    const { status } = check({
      [`${IN_SCOPE}/i.tsx`]: [
        'export const enabled = (a: boolean, b: boolean) => a && b;',
        'export const smaller = (a: number, b: number) => a > 0 && b < a;',
        '',
      ].join('\n'),
    });
    expect(status).toBe(0);
  });
});

describe('scope', () => {
  it('skips vendored registry files', () => {
    const { status } = check({
      [`${VENDORED}/toolbar.tsx`]: [
        'export const T = ({ show }: { show?: boolean }) => (',
        '  <div>{show && <span />}</div>',
        ');',
        '',
      ].join('\n'),
    });
    expect(status).toBe(0);
  });

  it('checks a hand-written file inside a vendored directory', () => {
    const { status, stdout } = check({
      [HAND_WRITTEN]: [
        'export const W = ({ label }: { label?: string }) => (',
        '  <div>{label && <span>{label}</span>}</div>',
        ');',
        '',
      ].join('\n'),
    });
    expect(status).toBe(1);
    expect(stdout).toContain(`${HAND_WRITTEN}:2  [conditional-jsx]`);
  });

  it('skips files outside the checked packages', () => {
    const { status } = check({
      'packages/tinacms/src/legacy.tsx': [
        'export const L = ({ label }: { label?: string }) => (',
        '  <div>{label && <span>{label}</span>}</div>',
        ');',
        '',
      ].join('\n'),
    });
    expect(status).toBe(0);
  });
});

describe('the repository', () => {
  it('has no convention violations', () => {
    const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
    expect(result.stdout).toBe('Conventions: no violations.\n');
    expect(result.status).toBe(0);
  });
});
