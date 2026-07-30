
import { createRequire } from 'node:module';

const packageJson: { version: string } = createRequire(import.meta.url)(
  '../../package.json'
);

export interface PackageVersion {
  fullVersion: string;
  major: string;
  minor: string;
  patch: string;
}

export const packageVersion = (): PackageVersion => {
  const fullVersion: string = packageJson.version;
  const [major, minor, patch] = fullVersion.split('.');
  return { fullVersion, major, minor, patch };
};
