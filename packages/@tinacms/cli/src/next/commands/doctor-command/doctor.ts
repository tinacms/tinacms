import path from 'path';
import fs from 'fs-extra';

export type DoctorStatus = 'current' | 'outdated' | 'unknown';

export type TinaDependency = {
  name: string;
  declared: string;
};

export type DoctorResult = TinaDependency & {
  latest?: string;
  status: DoctorStatus;
  error?: string;
};

type PackageJson = {
  dependencies?: Record<string, string>;
};

export function isTinaPackage(name: string) {
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
  return Object.entries(packageJson.dependencies || {})
    .filter(([name]) => isTinaPackage(name))
    .map(([name, declared]) => ({ name, declared }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function readProjectPackageJson(rootPath: string) {
  const packageJsonPath = path.join(rootPath, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error(`No package.json found at ${packageJsonPath}`);
  }
  return fs.readJSON(packageJsonPath);
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
    status: declaredAllowsVersion(dependency.declared, latest)
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
    ['Package', 'Declared', 'Latest', 'Status'],
    ...results.map((result) => [
      result.name,
      result.declared,
      result.latest || '-',
      result.status,
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

function declaredAllowsVersion(declared: string, latest: string) {
  const normalized = declared.trim();
  if (normalized === latest) {
    return true;
  }

  const version = parseVersion(latest);
  if (!version) {
    return false;
  }

  if (normalized.startsWith('^')) {
    const base = parseVersion(normalized.slice(1));
    return (
      !!base &&
      version.major === base.major &&
      compareVersions(version, base) >= 0
    );
  }

  if (normalized.startsWith('~')) {
    const base = parseVersion(normalized.slice(1));
    return (
      !!base &&
      version.major === base.major &&
      version.minor === base.minor &&
      compareVersions(version, base) >= 0
    );
  }

  return false;
}

function parseVersion(version: string) {
  const match = version.trim().match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return undefined;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function compareVersions(
  a: { major: number; minor: number; patch: number },
  b: { major: number; minor: number; patch: number }
) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}
