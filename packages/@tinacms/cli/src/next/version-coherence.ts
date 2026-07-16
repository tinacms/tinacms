import path from 'path';
import fs from 'fs-extra';

/**
 * Warns when the TinaCMS packages resolved from a user's project can't
 * satisfy the running CLI's declared ranges. pnpm rewrites the internal
 * `workspace:^` refs at publish time (exact pins on older releases), so the
 * CLI's own package.json states which sibling versions it expects. A resolved
 * sibling outside that range means a held-back package (stale lockfile entry,
 * partial upgrade, pnpm minimumReleaseAge) - a failure that is otherwise
 * silent. Warning only - this must never fail `dev` or `build`.
 */

/** Sibling packages the published CLI declares from its own release. */
export const CORE_PACKAGES = [
  'tinacms',
  '@tinacms/graphql',
  '@tinacms/schema-tools',
] as const;

const PLAIN_SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export interface ResolvedPackage {
  version: string;
  dir: string;
}

export interface VersionCoherenceInput {
  cliVersion: string;
  cliDependencies: Record<string, string>;
  resolvedFromProject: Record<string, ResolvedPackage | undefined>;
  /**
   * `tinacms` as resolved from `@tinacms/app`, the copy the admin bundle is
   * built from (Vite dedupes `tinacms` starting at the @tinacms/app root).
   */
  tinacmsResolvedFromApp?: ResolvedPackage;
}

/** Resolves a module entry path, e.g. via require.resolve. Must throw when not found. */
export type ResolveEntry = (packageName: string, fromDir: string) => string;

const parsePlainVersion = (
  version: string
): [number, number, number] | undefined => {
  const match = PLAIN_SEMVER.exec(version);
  if (!match) {
    return undefined;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const compareVersions = (
  a: [number, number, number],
  b: [number, number, number]
): number => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/**
 * True when `version` satisfies `spec`. Only the two shapes pnpm publishes
 * for workspace refs are supported: exact `X.Y.Z` and caret `^X.Y.Z`.
 * Anything else (including prereleases and the monorepo's unrewritten
 * `workspace:^`) returns undefined, meaning "can't tell - don't warn".
 */
export const satisfiesDeclaredRange = (
  version: string,
  spec: string
): boolean | undefined => {
  const resolved = parsePlainVersion(version);
  if (!resolved) {
    return undefined;
  }
  const isCaret = spec.startsWith('^');
  const base = parsePlainVersion(isCaret ? spec.slice(1) : spec);
  if (!base) {
    return undefined;
  }
  if (!isCaret) {
    return compareVersions(resolved, base) === 0;
  }
  if (resolved[0] !== base[0] || (base[0] === 0 && resolved[1] !== base[1])) {
    return false;
  }
  return compareVersions(resolved, base) >= 0;
};

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
}

const readPackageJson = (dir: string): PackageJson | undefined => {
  try {
    return fs.readJSONSync(path.join(dir, 'package.json'));
  } catch (_) {
    return undefined;
  }
};

/**
 * Walks up from `startDir` to the package.json belonging to `packageName`.
 * Several core packages have `exports` maps that don't expose
 * `./package.json`, so it can't be require.resolve'd directly.
 */
export const findPackageJsonAbove = (
  startDir: string,
  packageName: string
): { dir: string; packageJson: PackageJson } | undefined => {
  let dir = startDir;
  while (true) {
    const packageJson = readPackageJson(dir);
    if (packageJson?.name === packageName && packageJson.version) {
      return { dir, packageJson };
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return undefined;
    }
    dir = parent;
  }
};

export const resolvePackage = (
  packageName: string,
  fromDir: string,
  resolveEntry: ResolveEntry
): ResolvedPackage | undefined => {
  try {
    const entry = resolveEntry(packageName, fromDir);
    const found = findPackageJsonAbove(path.dirname(entry), packageName);
    if (found?.packageJson.version) {
      return { version: found.packageJson.version, dir: found.dir };
    }
  } catch (_) {
    // Package not installed in the project - nothing to compare.
  }
  return undefined;
};

export const getVersionCoherenceWarnings = (
  input: VersionCoherenceInput
): string[] => {
  const warnings: string[] = [];
  for (const name of CORE_PACKAGES) {
    const spec = input.cliDependencies?.[name];
    const resolved = input.resolvedFromProject[name];
    if (!spec || !resolved) {
      continue;
    }
    if (satisfiesDeclaredRange(resolved.version, spec) === false) {
      warnings.push(
        `${name}@${resolved.version} is installed, but @tinacms/cli@${input.cliVersion} expects ${name}@${spec}`
      );
    }
  }

  const fromProject = input.resolvedFromProject['tinacms'];
  const fromApp = input.tinacmsResolvedFromApp;
  if (fromProject && fromApp && fromProject.version !== fromApp.version) {
    warnings.push(
      `multiple copies of tinacms are installed: ${fromProject.version} (${fromProject.dir}) and ${fromApp.version} (${fromApp.dir}) - the admin UI bundles only one of them`
    );
  }
  return warnings;
};

/**
 * Gathers the installed versions and returns the skew warnings, or [] when
 * everything is coherent. `cliModuleDir` locates the running CLI's own
 * package.json and its copy of `@tinacms/app`; `resolveEntry` is injected so
 * this stays testable without `import.meta`.
 */
export const collectVersionCoherenceWarnings = ({
  rootPath,
  cliModuleDir,
  resolveEntry,
}: {
  rootPath: string;
  cliModuleDir: string;
  resolveEntry: ResolveEntry;
}): string[] => {
  try {
    const cli = findPackageJsonAbove(cliModuleDir, '@tinacms/cli');
    if (!cli?.packageJson.version) {
      return [];
    }

    const resolvedFromProject: Record<string, ResolvedPackage | undefined> = {};
    for (const name of CORE_PACKAGES) {
      resolvedFromProject[name] = resolvePackage(name, rootPath, resolveEntry);
    }

    const app = resolvePackage('@tinacms/app', cliModuleDir, resolveEntry);
    const tinacmsResolvedFromApp = app
      ? resolvePackage('tinacms', app.dir, resolveEntry)
      : undefined;

    return getVersionCoherenceWarnings({
      cliVersion: cli.packageJson.version,
      cliDependencies: cli.packageJson.dependencies || {},
      resolvedFromProject,
      tinacmsResolvedFromApp,
    });
  } catch (_) {
    // Best-effort check - never block dev/build on it.
    return [];
  }
};
