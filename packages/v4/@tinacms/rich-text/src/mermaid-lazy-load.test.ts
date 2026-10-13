import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = path.dirname(fileURLToPath(import.meta.url));

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
  });

// Captures the keyword that introduces a module specifier, the opening paren
// when one follows, and the specifier. `import` with a paren is the deferred
// form. Every other combination loads the module when the file that names it
// runs.
const SPECIFIER = /\b(from|import|require)\s*(\()?\s*['"]([^'"]+)['"]/g;

interface Reference {
  file: string;
  specifier: string;
  deferred: boolean;
}

const referencesIn = (contents: string, file = ''): Reference[] =>
  [...contents.matchAll(SPECIFIER)].map(([, keyword, paren, specifier]) => ({
    file,
    specifier,
    deferred: keyword === 'import' && paren === '(',
  }));

const referencesOf = (file: string): Reference[] =>
  referencesIn(readFileSync(file, 'utf8'), path.relative(SRC, file));

const isMermaid = ({ specifier }: Reference): boolean =>
  specifier === 'mermaid' || specifier.startsWith('mermaid/');

// mermaid is a large diagram renderer that most editing sessions never use. It
// stays behind `await import('mermaid')`. The browser fetches it when the
// editor renders or parses a diagram block, and not when the editor loads.
// A static import puts it in the same chunk as the editor and removes that
// saving, so this test reads the source and rejects the eager forms.
//
// TODO: swap for a browser spec like
// playwright/prebuilt-admin/e2e/mermaid-lazy.spec.ts once v4 has a production
// build. Nothing here to weigh: the package is private and exports raw `src`.
// A source scan also misses a static import reaching the bundle elsewhere.
describe('mermaid load', () => {
  const files = sourceFiles(SRC);

  it('has sources to check', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('tells the deferred import form apart from the eager ones', () => {
    const fixture = `
      import renderer from 'eager-default';
      import { named } from 'eager-named';
      import 'eager-side-effect';
      export { forwarded } from 'eager-reexport';
      const cjs = require('eager-require');
      const lazy = await import('deferred');
    `;
    expect(
      referencesIn(fixture).map(({ specifier, deferred }) => ({
        specifier,
        deferred,
      }))
    ).toEqual([
      { specifier: 'eager-default', deferred: false },
      { specifier: 'eager-named', deferred: false },
      { specifier: 'eager-side-effect', deferred: false },
      { specifier: 'eager-reexport', deferred: false },
      { specifier: 'eager-require', deferred: false },
      { specifier: 'deferred', deferred: true },
    ]);
  });

  it('finds real module specifiers across the source tree', () => {
    // Guards the two checks below: if SPECIFIER stops matching, the mermaid
    // references filter to [] and both checks pass without having run.
    expect(files.flatMap(referencesOf).length).toBeGreaterThan(200);
  });

  it('never names mermaid in a form that loads it with the editor', () => {
    const eager = files
      .flatMap(referencesOf)
      .filter((reference) => isMermaid(reference) && !reference.deferred)
      .map(({ file, specifier }) => ({ file, specifier }));

    expect(eager).toEqual([]);
  });

  it('still reaches mermaid through a deferred import', () => {
    const deferred = files
      .flatMap(referencesOf)
      .filter((reference) => isMermaid(reference) && reference.deferred);

    expect(deferred.length).toBeGreaterThan(0);
  });
});
