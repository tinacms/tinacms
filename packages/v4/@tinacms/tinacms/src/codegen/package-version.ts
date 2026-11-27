import type { PackageVersion } from '@tinacms/v4-content/lock';
// A JSON import, not createRequire: the main entry reaches this file through
// compile-schema, and a browser imports that entry for defineConfig, so nothing
// here may touch a node builtin.
import packageJson from '../../package.json';

export type { PackageVersion };

export const packageVersion = (): PackageVersion => {
  const fullVersion: string = packageJson.version;
  const [major, minor, patch] = fullVersion.split('.');
  return { fullVersion, major, minor, patch };
};
