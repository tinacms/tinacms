import type { Config } from '@tinacms/schema-tools';
import {
  EXTERNAL_BASELINE,
  resolveDatabaseExternals,
} from './external-resolver';

/**
 * Helper to build a minimal Config object with just the build fields these
 * tests care about. Casts the result so we don't have to fill in every
 * required Config property unrelated to externalize behavior.
 */
const buildConfig = (externalDependencies?: string[]): Config | undefined => {
  if (externalDependencies === undefined) {
    return {
      build: { publicFolder: 'public', outputFolder: 'admin' },
    } as unknown as Config;
  }
  return {
    build: {
      publicFolder: 'public',
      outputFolder: 'admin',
      externalDependencies,
    },
  } as unknown as Config;
};

describe('EXTERNAL_BASELINE', () => {
  it('always externalizes better-sqlite3', () => {
    // Locks in the canonical native-module case at the type level — every
    // build inherits this, regardless of user config.
    expect(EXTERNAL_BASELINE).toContain('better-sqlite3');
  });
});

describe('resolveDatabaseExternals', () => {
  it('returns the baseline when no user extensions are provided', () => {
    expect(resolveDatabaseExternals(buildConfig())).toEqual(EXTERNAL_BASELINE);
  });

  it('returns the baseline when config is undefined', () => {
    expect(resolveDatabaseExternals(undefined)).toEqual(EXTERNAL_BASELINE);
  });

  it('returns the baseline when build is undefined', () => {
    expect(resolveDatabaseExternals({} as Config)).toEqual(EXTERNAL_BASELINE);
  });

  it('appends user-provided extensions after the baseline', () => {
    const result = resolveDatabaseExternals(
      buildConfig(['my-custom-native-adapter', 'another-pkg'])
    );
    expect(result).toEqual([
      'better-sqlite3',
      'my-custom-native-adapter',
      'another-pkg',
    ]);
  });

  it('preserves the user list order', () => {
    const result = resolveDatabaseExternals(buildConfig(['z-pkg', 'a-pkg']));
    expect(result).toEqual(['better-sqlite3', 'z-pkg', 'a-pkg']);
  });

  it('handles an empty user-extension list', () => {
    expect(resolveDatabaseExternals(buildConfig([]))).toEqual(
      EXTERNAL_BASELINE
    );
  });

  it('does not mutate the baseline when called with extensions', () => {
    const before = [...EXTERNAL_BASELINE];
    resolveDatabaseExternals(buildConfig(['my-pkg']));
    expect(EXTERNAL_BASELINE).toEqual(before);
  });

  it('puts the baseline first so users cannot accidentally drop it', () => {
    // Even if the user listed better-sqlite3 themselves (redundantly), the
    // baseline copy comes first — this is intentional so the contract holds:
    // `result[0..baseline.length]` is always the baseline, no matter what
    // the user provides.
    const result = resolveDatabaseExternals(
      buildConfig(['better-sqlite3', 'my-pkg'])
    );
    expect(result.slice(0, EXTERNAL_BASELINE.length)).toEqual(
      EXTERNAL_BASELINE
    );
  });
});
