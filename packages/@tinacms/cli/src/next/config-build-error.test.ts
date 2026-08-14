import * as esbuild from 'esbuild';
import { formatConfigBuildError } from './config-build-error';

describe('formatConfigBuildError', () => {
  it('adds project-root and parent-directory guidance for tinacms resolve errors', () => {
    const error = formatConfigBuildError({
      error: {
        errors: [{ text: 'Could not resolve "tinacms"' }],
      },
      rootPath: '/site',
    });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(
      'Unable to resolve the "tinacms" package while building your Tina config.'
    );
    expect((error as Error).message).toContain('Tina looked from: /site');
    expect((error as Error).message).toContain('package.json');
    expect((error as Error).message).toContain('node_modules');
    expect((error as Error).message).toContain('.pnp.cjs');
  });

  it('names the specific @tinacms package that failed to resolve', () => {
    const error = formatConfigBuildError({
      error: { errors: [{ text: 'Could not resolve "@tinacms/datalayer"' }] },
      rootPath: '/site',
    });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(
      'Unable to resolve the "@tinacms/datalayer" package'
    );
    expect((error as Error).message).toContain('Tina looked from: /site');
    expect((error as Error).message).toContain('.pnp.cjs');
  });

  it('preserves esbuild location (file, line, column, offending import) when present', () => {
    const error = formatConfigBuildError({
      error: {
        errors: [
          {
            text: 'Could not resolve "tinacms"',
            location: {
              file: 'tina/config.ts',
              line: 1,
              column: 29,
              lineText: 'import { defineConfig } from "tinacms"',
            },
          },
        ],
      },
      rootPath: '/site',
    });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(
      'Failing import: tina/config.ts:1:29'
    );
    expect((error as Error).message).toContain(
      'import { defineConfig } from "tinacms"'
    );
  });

  it('returns unrelated errors unchanged', () => {
    const original = new Error('Unexpected token');
    expect(
      formatConfigBuildError({
        error: original,
        rootPath: '/site',
      })
    ).toBe(original);
  });

  // Detection keys on esbuild's `Could not resolve "..."` string. Feeding
  // hardcoded strings above can't catch an esbuild reword that changes that
  // wording — a real failing build can. This runs esbuild against a bare
  // `@tinacms/*` specifier that cannot exist, then asserts we still rewrite the
  // thrown error, so a message drift at the next esbuild bump fails CI loudly.
  it('rewrites a real esbuild resolve failure', async () => {
    let thrown: unknown;
    try {
      await esbuild.build({
        stdin: {
          contents: 'import "@tinacms/__tina_resolve_probe__";',
          resolveDir: process.cwd(),
          loader: 'ts',
        },
        bundle: true,
        write: false,
        logLevel: 'silent',
      });
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeDefined();
    const formatted = formatConfigBuildError({
      error: thrown,
      rootPath: '/site',
    });
    expect(formatted).toBeInstanceOf(Error);
    expect((formatted as Error).message).toContain(
      'Unable to resolve the "@tinacms/__tina_resolve_probe__" package'
    );
  });
});
