import spawn from 'cross-spawn';
import { PackageManager } from './packageManagers';

/**
 * Spawn a package manager installation.
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export function install(packageManager: PackageManager): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(packageManager, ['install'], {
      stdio: 'ignore',
      env: { ...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1' },
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject({ command: `${packageManager} install` });
        return;
      }
      resolve();
    });
  });
}
