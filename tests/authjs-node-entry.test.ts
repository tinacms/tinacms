import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/tinacms-authjs');
const NODE_ENTRY = path.join(PKG, 'dist/index.js');

// Runs against the build, and shells out to a real node process, because Vite
// resolves what Node's ESM loader will not and would mask both regressions (#7434).
describe('tinacms-authjs node entry', () => {
  it('imports only next-auth', () => {
    const built = fs.readFileSync(NODE_ENTRY, 'utf-8');
    const specifiers = [
      ...built.matchAll(/^import\s[^'"]*['"]([^'"]+)['"]/gm),
    ].map((m) => m[1]);

    expect(specifiers.length).toBeGreaterThan(0);
    expect(
      specifiers.filter((s) => s !== 'next-auth' && !s.startsWith('next-auth/'))
    ).toEqual([]);
  });

  it('builds a credentials provider under plain node ESM', () => {
    const script = `
      const { TinaCredentialsProvider } = await import(${JSON.stringify(
        NODE_ENTRY
      )})
      process.stdout.write(TinaCredentialsProvider({ databaseClient: {} }).type)
    `;

    const type = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', script],
      {
        encoding: 'utf-8',
      }
    );

    expect(type).toBe('credentials');
  });
});
