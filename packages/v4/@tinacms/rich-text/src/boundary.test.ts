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

const IMPORT = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

const importsOf = (file: string): string[] => {
  const contents = readFileSync(file, 'utf8');
  return [...contents.matchAll(IMPORT)].map((match) => match[1]);
};

describe('package boundary', () => {
  const files = sourceFiles(SRC);

  it('has sources to check', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('extracts every specifier from a fixture with all import forms', () => {
    const fixture = `
      import Default from '@tinacms/tinacms';
      import { Named } from '@tinacms/tinacms/react';
      export { Reexported } from '../../outside';
      const dynamic = await import('./local');
    `;
    expect([...fixture.matchAll(IMPORT)].map((match) => match[1])).toEqual([
      '@tinacms/tinacms',
      '@tinacms/tinacms/react',
      '../../outside',
      './local',
    ]);
  });

  it('finds real import specifiers across the source tree', () => {
    // Guards the two checks below: if IMPORT stops matching, offenders
    // silently filters to [] and both checks pass without having run.
    const totalImports = files.flatMap(importsOf);
    expect(totalImports.length).toBeGreaterThan(200);
  });

  it('never imports the host package', () => {
    const offenders = files.filter((file) =>
      importsOf(file).some((specifier) =>
        specifier.startsWith('@tinacms/tinacms')
      )
    );
    expect(offenders.map((file) => path.relative(SRC, file))).toEqual([]);
  });

  it('never reaches outside its own src directory', () => {
    const offenders = files.filter((file) =>
      importsOf(file)
        .filter((specifier) => specifier.startsWith('.'))
        .some((specifier) => {
          const resolved = path.resolve(path.dirname(file), specifier);
          return !resolved.startsWith(SRC);
        })
    );
    expect(offenders.map((file) => path.relative(SRC, file))).toEqual([]);
  });
});
