import { getExternalPackagesFromEnv } from './config-manager';

describe('getExternalPackagesFromEnv', () => {
  it('returns an empty array when env var is undefined', () => {
    expect(getExternalPackagesFromEnv(undefined)).toEqual([]);
  });

  it('returns an empty array when env var is empty', () => {
    expect(getExternalPackagesFromEnv('')).toEqual([]);
  });

  it('parses comma-separated package names', () => {
    expect(getExternalPackagesFromEnv('better-sqlite3,node-bindings')).toEqual([
      'better-sqlite3',
      'node-bindings',
    ]);
  });

  it('trims package names and ignores empty entries', () => {
    expect(
      getExternalPackagesFromEnv(' better-sqlite3, node-bindings , ,')
    ).toEqual(['better-sqlite3', 'node-bindings']);
  });
});
