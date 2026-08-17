import path from 'path';
import fs from 'fs-extra';
import yaml from 'js-yaml';

export type DoctorStatus = 'current' | 'local' | 'outdated' | 'unknown';

export type TinaDependency = {
  name: string;
  declared: string;
  dependencyType: DependencyType;
  installed?: string;
};

export type DoctorResult = TinaDependency & {
  latest?: string;
  status: DoctorStatus;
  error?: string;
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

type DependencyType =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies';

const DEPENDENCY_TYPES: DependencyType[] = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];
const LOCAL_REFERENCE_PREFIXES = [
  'file:',
  'link:',
  'patch:',
  'portal:',
  'workspace:',
];

export function isTinaPackage(name: string): boolean {
  return (
    name === 'tinacms' ||
    name === 'create-tina-app' ||
    name.startsWith('@tinacms/') ||
    name.startsWith('tinacms-') ||
    name.startsWith('next-tinacms-')
  );
}

export function getTinaDependencies(
  packageJson: PackageJson
): TinaDependency[] {
  const dependencies = new Map<string, TinaDependency>();

  for (const dependencyType of DEPENDENCY_TYPES) {
    for (const [name, declared] of Object.entries(
      packageJson[dependencyType] || {}
    )) {
      if (!isTinaPackage(name) || dependencies.has(name)) continue;
      dependencies.set(name, { name, declared, dependencyType });
    }
  }

  return [...dependencies.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export async function readProjectPackageJson(rootPath: string) {
  const packageJsonPath = path.join(rootPath, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error(`No package.json found at ${packageJsonPath}`);
  }
  return fs.readJSON(packageJsonPath);
}

export async function resolveInstalledVersions({
  rootPath,
  dependencies,
}: {
  rootPath: string;
  dependencies: TinaDependency[];
}): Promise<TinaDependency[]> {
  const lockfileVersions = await readLockfileVersions(rootPath);

  return Promise.all(
    dependencies.map(async (dependency) => {
      const installed =
        (await readNodeModulesVersion(rootPath, dependency.name)) ||
        lockfileVersions.get(dependency.name);
      return { ...dependency, installed };
    })
  );
}

export async function fetchLatestVersion(
  packageName: string,
  timeoutMs: number
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`,
      { signal: controller.signal }
    );
    if (!response.ok) {
      throw new Error(`npm registry returned ${response.status}`);
    }
    const body = await response.json();
    const latest = body?.['dist-tags']?.latest;
    if (typeof latest !== 'string' || latest.length === 0) {
      throw new Error('npm registry response did not include dist-tags.latest');
    }
    return latest;
  } finally {
    clearTimeout(timeout);
  }
}

export function classifyDependency(
  dependency: TinaDependency,
  latest?: string,
  error?: string
): DoctorResult {
  if (!dependency.installed) {
    return {
      ...dependency,
      latest,
      status: 'unknown',
      error:
        'Installed version could not be resolved from node_modules or lockfile',
    };
  }

  if (isLocalReference(dependency.installed)) {
    return {
      ...dependency,
      latest,
      status: 'local',
      error,
    };
  }

  if (!latest || error) {
    return {
      ...dependency,
      latest,
      status: 'unknown',
      error,
    };
  }

  return {
    ...dependency,
    latest,
    status:
      normalizeVersion(dependency.installed) === normalizeVersion(latest)
        ? 'current'
        : 'outdated',
  };
}

export async function checkTinaDependencies({
  dependencies,
  fetchLatest,
}: {
  dependencies: TinaDependency[];
  fetchLatest: (name: string) => Promise<string>;
}): Promise<DoctorResult[]> {
  return Promise.all(
    dependencies.map(async (dependency) => {
      try {
        const latest = await fetchLatest(dependency.name);
        return classifyDependency(dependency, latest);
      } catch (error) {
        return classifyDependency(
          dependency,
          undefined,
          error instanceof Error ? error.message : String(error)
        );
      }
    })
  );
}

export function formatDoctorTable(results: DoctorResult[]) {
  const rows = [
    ['Package', 'Type', 'Declared', 'Installed', 'Latest', 'Status'],
    ...results.map((result) => [
      result.name,
      result.dependencyType,
      result.declared,
      result.installed || '-',
      result.latest || '-',
      formatStatus(result),
    ]),
  ];
  const widths = rows[0].map((_, column) =>
    Math.max(...rows.map((row) => row[column].length))
  );

  return rows
    .map((row, rowIndex) => {
      const line = row
        .map((cell, column) => cell.padEnd(widths[column]))
        .join('  ');
      return rowIndex === 0
        ? `${line}\n${widths.map((w) => '-'.repeat(w)).join('  ')}`
        : line;
    })
    .join('\n');
}

function formatStatus(result: DoctorResult): string {
  if (result.status === 'outdated') return 'OUTDATED';
  if (result.status === 'local') return 'LOCAL';
  if (result.status === 'unknown')
    return `UNKNOWN${result.error ? ` (${result.error})` : ''}`;
  return 'CURRENT';
}

function normalizeVersion(version: string): string {
  return version.trim().replace(/^v/, '').split('(')[0].trim();
}

function isLocalReference(version: string): boolean {
  const normalized = version.trim();
  return LOCAL_REFERENCE_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix)
  );
}

async function readNodeModulesVersion(
  rootPath: string,
  packageName: string
): Promise<string | undefined> {
  const packageJsonPath = path.join(
    rootPath,
    'node_modules',
    ...packageName.split('/'),
    'package.json'
  );

  if (!(await fs.pathExists(packageJsonPath))) return undefined;

  const packageJson = await fs.readJSON(packageJsonPath);
  return typeof packageJson.version === 'string'
    ? packageJson.version
    : undefined;
}

async function readLockfileVersions(
  rootPath: string
): Promise<Map<string, string>> {
  const readers = [
    readPackageLockVersions,
    readPnpmLockVersions,
    readYarnLockVersions,
  ];

  for (const reader of readers) {
    const versions = await reader(rootPath);
    if (versions.size > 0) return versions;
  }

  return new Map();
}

async function readPackageLockVersions(
  rootPath: string
): Promise<Map<string, string>> {
  const lockfilePath = path.join(rootPath, 'package-lock.json');
  const versions = new Map<string, string>();
  if (!(await fs.pathExists(lockfilePath))) return versions;

  const lockfile = await fs.readJSON(lockfilePath);

  for (const [key, value] of Object.entries(lockfile.packages || {})) {
    if (!key.startsWith('node_modules/')) continue;
    const name = key.replace(/^node_modules\//, '');
    const version = (value as { version?: unknown }).version;
    if (isTinaPackage(name) && typeof version === 'string') {
      versions.set(name, version);
    }
  }

  for (const [name, value] of Object.entries(lockfile.dependencies || {})) {
    const version = (value as { version?: unknown }).version;
    if (isTinaPackage(name) && typeof version === 'string') {
      versions.set(name, version);
    }
  }

  return versions;
}

async function readPnpmLockVersions(
  rootPath: string
): Promise<Map<string, string>> {
  const lockfilePath = path.join(rootPath, 'pnpm-lock.yaml');
  const versions = new Map<string, string>();
  if (!(await fs.pathExists(lockfilePath))) return versions;

  const lockfile = yaml.load(await fs.readFile(lockfilePath, 'utf8')) as any;
  const rootImporter = lockfile?.importers?.['.'];

  for (const dependencyType of DEPENDENCY_TYPES) {
    for (const [name, value] of Object.entries(
      rootImporter?.[dependencyType] || {}
    )) {
      if (!isTinaPackage(name)) continue;
      const version =
        typeof value === 'string'
          ? value
          : typeof (value as { version?: unknown }).version === 'string'
            ? (value as { version: string }).version
            : undefined;
      if (version) versions.set(name, normalizeInstalledVersion(version));
    }
  }

  for (const key of Object.keys(lockfile?.packages || {})) {
    const parsed = parsePnpmPackageKey(key);
    if (parsed && isTinaPackage(parsed.name) && !versions.has(parsed.name)) {
      versions.set(parsed.name, parsed.version);
    }
  }

  return versions;
}

async function readYarnLockVersions(
  rootPath: string
): Promise<Map<string, string>> {
  const lockfilePath = path.join(rootPath, 'yarn.lock');
  const versions = new Map<string, string>();
  if (!(await fs.pathExists(lockfilePath))) return versions;

  const contents = await fs.readFile(lockfilePath, 'utf8');
  if (contents.includes('__metadata:')) {
    return readYarnBerryLockVersions(contents);
  }

  const lines = contents.split('\n');
  let activeNames: string[] = [];
  for (const line of lines) {
    if (line.length > 0 && !line.startsWith(' ') && line.includes('@')) {
      activeNames = extractYarnPackageNames(line);
      continue;
    }

    const version = line.match(/^\s+version\s+"([^"]+)"/)?.[1];
    if (!version) continue;

    for (const name of activeNames) {
      if (isTinaPackage(name) && !versions.has(name)) {
        versions.set(name, version);
      }
    }
  }

  return versions;
}

function readYarnBerryLockVersions(contents: string): Map<string, string> {
  const versions = new Map<string, string>();
  const lockfile = yaml.load(contents) as Record<string, { version?: unknown }>;

  for (const [descriptor, value] of Object.entries(lockfile || {})) {
    if (descriptor === '__metadata') continue;
    const name = extractYarnBerryPackageName(descriptor);
    const version = getYarnBerryInstalledVersion(descriptor, value?.version);
    if (name && isTinaPackage(name) && version) {
      versions.set(name, version);
    }
  }

  return versions;
}

function parsePnpmPackageKey(
  key: string
): { name: string; version: string } | undefined {
  const normalized = key.replace(/^\//, '');
  const match = normalized.match(/^(@[^/]+\/[^@]+|[^@/]+)@([^(/]+)/);
  if (!match) return undefined;
  return { name: match[1], version: normalizeVersion(match[2]) };
}

function normalizeInstalledVersion(version: string): string {
  return isLocalReference(version) ? version : normalizeVersion(version);
}

function extractYarnPackageNames(line: string): string[] {
  return line
    .replace(/:$/, '')
    .split(/,\s*/)
    .map((descriptor) => descriptor.trim().replace(/^"|"$/g, ''))
    .map((descriptor) => {
      if (descriptor.startsWith('@')) {
        const [, scope, name] = descriptor.match(/^(@[^/]+)\/([^@]+)/) || [];
        return scope && name ? `${scope}/${name}` : descriptor;
      }
      return descriptor.split('@')[0];
    })
    .filter(Boolean);
}

function extractYarnBerryPackageName(descriptor: string): string | undefined {
  if (descriptor.startsWith('@')) {
    return descriptor.match(/^(@[^/]+\/[^@]+)/)?.[1];
  }
  return descriptor.split('@')[0] || undefined;
}

function getYarnBerryInstalledVersion(
  descriptor: string,
  version: unknown
): string | undefined {
  const name = extractYarnBerryPackageName(descriptor);
  const reference = name ? descriptor.slice(name.length + 1) : undefined;
  if (reference && isLocalReference(reference)) return reference;

  return typeof version === 'string'
    ? normalizeInstalledVersion(version)
    : undefined;
}
