import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// The extraction rests on one property: this package never imports its host.
// `@tinacms/tinacms` depends on this one, so an import back would be a cycle —
// and a cycle pnpm tolerates, so nothing else would complain until a bundler or
// a publish did. Cheap to assert, and it is the thing that quietly rots: the
// editor used to reach for `useActiveField`, and someone re-adding that import
// would find it working locally.
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

  it('never imports the host package', () => {
    const offenders = files.filter((file) =>
      importsOf(file).some((specifier) =>
        specifier.startsWith('@tinacms/tinacms')
      )
    );
    expect(offenders.map((file) => path.relative(SRC, file))).toEqual([]);
  });

  it('never reaches outside its own src directory', () => {
    // A relative path that climbs past src/ would resolve into the host's tree
    // in this monorepo — same cycle, harder to spot than a bare specifier.
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
