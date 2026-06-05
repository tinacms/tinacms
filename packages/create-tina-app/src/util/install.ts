import spawn from 'cross-spawn';
import { PackageManager } from './packageManagers';

/** Keep only the last N chars of captured output so error messages stay readable. */
const MAX_OUTPUT_CHARS = 4000;

/**
 * pnpm 10+ blocks dependency build scripts (e.g. better-sqlite3, sharp, esbuild)
 * by default and prints this advisory. When it's the reason an install looks
 * broken, we point the user at the one-liner that unblocks it.
 */
function isPnpmIgnoredBuilds(output: string): boolean {
  return (
    output.includes('ERR_PNPM_IGNORED_BUILDS') ||
    output.includes('Ignored build scripts')
  );
}

/**
 * Spawn a package manager installation.
 *
 * @returns A Promise that resolves once the installation is finished.
 *   On failure it rejects with an `Error` whose message includes the command,
 *   the exit code, and the tail of the captured output.
 */
export function install(
  packageManager: PackageManager,
  verboseOutput: boolean
): Promise<void> {
  const command = `${packageManager} install`;

  return new Promise((resolve, reject) => {
    // Always pipe stderr so we can surface the real error even in non-verbose
    // mode. In verbose mode we additionally stream it straight to the terminal.
    const child = spawn(packageManager, ['install'], {
      stdio: verboseOutput ? 'inherit' : ['ignore', 'ignore', 'pipe'],
      env: { ...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1' },
    });

    let captured = '';
    child.stderr?.on('data', (chunk) => {
      captured = (captured + chunk.toString()).slice(-MAX_OUTPUT_CHARS);
    });

    // e.g. the package manager binary isn't on PATH.
    child.on('error', (err) => {
      reject(
        new Error(
          `Failed to run "${command}": ${(err as Error).message}`
        )
      );
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const details = captured.trim();
      let message = `"${command}" exited with code ${code ?? 'unknown'}.`;
      if (details) {
        message += `\n\n${details}`;
      }
      if (isPnpmIgnoredBuilds(captured)) {
        message +=
          `\n\nSome dependencies' build scripts were blocked by pnpm. ` +
          `Run "${packageManager} approve-builds" (then "${packageManager} install") ` +
          `in your project directory to allow them.`;
      }

      reject(new Error(message));
    });
  });
}
