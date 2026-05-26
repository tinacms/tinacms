import spawn from 'cross-spawn';
import { PackageManager } from './packageManagers';

/**
 * Spawn a package manager installation.
 *
 * @returns A Promise that resolves once the installation is finished.
 */
export function install(
  packageManager: PackageManager,
  verboseOutput: boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(packageManager, ['install'], {
      stdio: verboseOutput ? 'inherit' : ['ignore', 'ignore', 'pipe'],
      env: { ...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1' },
    });

    let stderr = '';
    if (!verboseOutput && child.stderr) {
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (chunk: string) => {
        stderr += chunk;
      });
    }

    child.on('error', (err) => {
      reject(
        new Error(`Could not run \`${packageManager} install\`: ${err.message}`)
      );
    });

    child.on('close', (code) => {
      if (code !== 0) {
        const tail = stderr.trim().split('\n').slice(-30).join('\n');
        const detail = tail ? `\n${tail}` : '';
        reject(
          new Error(
            `\`${packageManager} install\` exited with code ${code}.${detail}`
          )
        );
        return;
      }
      resolve();
    });
  });
}
