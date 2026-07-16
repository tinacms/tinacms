import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import {
  type ResolveEntry,
  collectVersionCoherenceWarnings,
  getVersionCoherenceWarnings,
  resolvePackage,
  satisfiesDeclaredRange,
} from './version-coherence';

describe('satisfiesDeclaredRange', () => {
  it('matches exact pins', () => {
    expect(satisfiesDeclaredRange('3.10.1', '3.10.1')).toBe(true);
    expect(satisfiesDeclaredRange('3.9.3', '3.10.1')).toBe(false);
    expect(satisfiesDeclaredRange('3.10.2', '3.10.1')).toBe(false);
  });

  it('matches caret ranges', () => {
    expect(satisfiesDeclaredRange('3.10.1', '^3.10.1')).toBe(true);
    expect(satisfiesDeclaredRange('3.11.0', '^3.10.1')).toBe(true);
    expect(satisfiesDeclaredRange('3.9.3', '^3.10.1')).toBe(false);
    expect(satisfiesDeclaredRange('4.0.0', '^3.10.1')).toBe(false);
    expect(satisfiesDeclaredRange('2.9.0', '^3.10.1')).toBe(false);
  });

  it('keeps caret ranges within the minor for 0.x versions', () => {
    expect(satisfiesDeclaredRange('0.2.5', '^0.2.3')).toBe(true);
    expect(satisfiesDeclaredRange('0.3.0', '^0.2.3')).toBe(false);
  });

  it('treats caret ranges on 0.0.x versions as exact', () => {
    expect(satisfiesDeclaredRange('0.0.3', '^0.0.3')).toBe(true);
    expect(satisfiesDeclaredRange('0.0.4', '^0.0.3')).toBe(false);
  });

  it('returns undefined for specs and versions it cannot interpret', () => {
    expect(satisfiesDeclaredRange('3.10.1', 'workspace:^')).toBeUndefined();
    expect(satisfiesDeclaredRange('3.10.1', 'workspace:*')).toBeUndefined();
    expect(satisfiesDeclaredRange('3.10.1', '~3.10.1')).toBeUndefined();
    expect(satisfiesDeclaredRange('4.0.0-beta.1', '^3.10.1')).toBeUndefined();
    expect(satisfiesDeclaredRange('3.10.1', '^4.0.0-beta.1')).toBeUndefined();
  });
});

describe('getVersionCoherenceWarnings', () => {
  const resolved = (version: string, dir = `/project/node_modules`) => ({
    version,
    dir,
  });

  it('returns no warnings when every package satisfies its range', () => {
    const warnings = getVersionCoherenceWarnings({
      cliVersion: '2.5.5',
      cliDependencies: { tinacms: '^3.10.1', '@tinacms/graphql': '^2.4.8' },
      resolvedFromProject: {
        tinacms: resolved('3.10.1'),
        '@tinacms/graphql': resolved('2.4.8'),
      },
      tinacmsResolvedFromApp: resolved('3.10.1', '/other/dir'),
    });
    expect(warnings).toEqual([]);
  });

  it('warns when a package is held back behind the CLI range', () => {
    const warnings = getVersionCoherenceWarnings({
      cliVersion: '2.5.5',
      cliDependencies: { tinacms: '^3.10.1' },
      resolvedFromProject: { tinacms: resolved('3.9.3') },
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('tinacms@3.9.3');
    expect(warnings[0]).toContain('@tinacms/cli@2.5.5');
    expect(warnings[0]).toContain('tinacms@^3.10.1');
  });

  it('stays silent inside the monorepo where refs are workspace ranges', () => {
    const warnings = getVersionCoherenceWarnings({
      cliVersion: '2.5.5',
      cliDependencies: { tinacms: 'workspace:^' },
      resolvedFromProject: { tinacms: resolved('3.9.3') },
    });
    expect(warnings).toEqual([]);
  });

  it('skips packages that are not installed', () => {
    const warnings = getVersionCoherenceWarnings({
      cliVersion: '2.5.5',
      cliDependencies: { tinacms: '^3.10.1' },
      resolvedFromProject: {},
    });
    expect(warnings).toEqual([]);
  });

  it('warns when two different copies of tinacms are resolved', () => {
    const warnings = getVersionCoherenceWarnings({
      cliVersion: '2.5.5',
      cliDependencies: { tinacms: '^3.9.0' },
      resolvedFromProject: { tinacms: resolved('3.9.3', '/project/a') },
      tinacmsResolvedFromApp: resolved('3.10.1', '/project/b'),
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('multiple copies of tinacms');
    expect(warnings[0]).toContain('3.9.3');
    expect(warnings[0]).toContain('3.10.1');
  });

  it('does not treat the same version in two locations as a duplicate', () => {
    const warnings = getVersionCoherenceWarnings({
      cliVersion: '2.5.5',
      cliDependencies: { tinacms: '^3.10.1' },
      resolvedFromProject: { tinacms: resolved('3.10.1', '/project/a') },
      tinacmsResolvedFromApp: resolved('3.10.1', '/project/b'),
    });
    expect(warnings).toEqual([]);
  });
});

describe('resolution against a real directory layout', () => {
  let root: string;

  // Mirrors node resolution for the fixture: looks for
  // node_modules/<name>/index.js in fromDir and each parent directory.
  const resolveEntry: ResolveEntry = (packageName, fromDir) => {
    let dir = fromDir;
    while (true) {
      const entry = path.join(
        dir,
        'node_modules',
        ...packageName.split('/'),
        'index.js'
      );
      if (fs.existsSync(entry)) {
        return entry;
      }
      const parent = path.dirname(dir);
      if (parent === dir) {
        throw new Error(`Cannot find module '${packageName}'`);
      }
      dir = parent;
    }
  };

  const addPackage = (
    baseDir: string,
    name: string,
    version: string,
    dependencies?: Record<string, string>
  ) => {
    const dir = path.join(baseDir, 'node_modules', ...name.split('/'));
    fs.outputFileSync(path.join(dir, 'index.js'), '');
    fs.outputJsonSync(path.join(dir, 'package.json'), {
      name,
      version,
      ...(dependencies ? { dependencies } : {}),
    });
    return dir;
  };

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'version-coherence-'));

    // A project holding tinacms back at 3.9.3.
    const projectDir = path.join(root, 'project');
    addPackage(projectDir, 'tinacms', '3.9.3');
    addPackage(projectDir, '@tinacms/graphql', '2.4.8');
    addPackage(projectDir, '@tinacms/schema-tools', '2.8.3');

    // The installed CLI, published expecting tinacms ^3.10.1, with its own
    // nested @tinacms/app whose tinacms copy is in range.
    const cliDir = addPackage(projectDir, '@tinacms/cli', '2.5.5', {
      tinacms: '^3.10.1',
      '@tinacms/app': '^2.5.9',
      '@tinacms/graphql': '^2.4.8',
      '@tinacms/schema-tools': '^2.8.3',
    });
    const appDir = addPackage(cliDir, '@tinacms/app', '2.5.9');
    addPackage(appDir, 'tinacms', '3.10.1');
  });

  afterAll(() => {
    fs.removeSync(root);
  });

  it('resolvePackage finds the package.json above the entry point', () => {
    const projectDir = path.join(root, 'project');
    expect(resolvePackage('tinacms', projectDir, resolveEntry)).toEqual({
      version: '3.9.3',
      dir: path.join(projectDir, 'node_modules', 'tinacms'),
    });
    expect(
      resolvePackage('not-installed', projectDir, resolveEntry)
    ).toBeUndefined();
  });

  it('collects held-back and duplicate-copy warnings end to end', () => {
    const projectDir = path.join(root, 'project');
    const cliModuleDir = path.join(
      projectDir,
      'node_modules',
      '@tinacms',
      'cli',
      'dist'
    );
    const warnings = collectVersionCoherenceWarnings({
      rootPath: projectDir,
      cliModuleDir,
      resolveEntry,
    });
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain(
      'tinacms@3.9.3 is installed, but @tinacms/cli@2.5.5 expects tinacms@^3.10.1'
    );
    expect(warnings[1]).toContain('multiple copies of tinacms');
  });
});
