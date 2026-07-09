import {
  formatConfigBuildError,
  isTinacmsResolveError,
} from './config-build-error';

describe('isTinacmsResolveError', () => {
  it('detects esbuild structured tinacms resolve errors', () => {
    expect(
      isTinacmsResolveError({
        errors: [{ text: 'Could not resolve "tinacms"' }],
      })
    ).toBe(true);
  });

  it('detects tinacms resolve errors from the formatted message', () => {
    expect(
      isTinacmsResolveError(
        new Error(
          'Build failed with 1 error:\ntina/config.ts:1:20: ERROR: Could not resolve "tinacms"'
        )
      )
    ).toBe(true);
  });

  it('ignores unrelated build errors', () => {
    expect(
      isTinacmsResolveError({
        errors: [{ text: 'Could not resolve "some-other-package"' }],
      })
    ).toBe(false);
  });

  it('detects @tinacms/* subpackage resolve errors', () => {
    expect(
      isTinacmsResolveError({
        errors: [{ text: 'Could not resolve "@tinacms/schema-tools"' }],
      })
    ).toBe(true);
  });

  it('detects @tinacms/* resolve errors from the formatted message', () => {
    expect(
      isTinacmsResolveError(
        new Error(
          'Build failed with 1 error:\ntina/database.ts:1:44: ERROR: Could not resolve "@tinacms/datalayer"'
        )
      )
    ).toBe(true);
  });

  it('ignores lookalike packages that merely contain "tinacms"', () => {
    expect(
      isTinacmsResolveError({
        errors: [{ text: 'Could not resolve "my-tinacms-plugin"' }],
      })
    ).toBe(false);
  });
});

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

  it('returns unrelated errors unchanged', () => {
    const original = new Error('Unexpected token');
    expect(
      formatConfigBuildError({
        error: original,
        rootPath: '/site',
      })
    ).toBe(original);
  });
});
