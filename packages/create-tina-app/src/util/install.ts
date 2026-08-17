import spawn from 'cross-spawn';
import { PackageManager } from './packageManagers';

/** Keep only the last N chars of captured output so error messages stay readable. */
const MAX_OUTPUT_CHARS = 4000;

// npm is silent when piped without this; the flag makes it stream per-package
// activity. pnpm and yarn stream on their own; bun stays quiet (no such flag).
const STREAM_FLAGS: Partial<Record<PackageManager, string[]>> = {
  npm: ['--loglevel', 'http'],
};

/**
 * Spawn a package manager installation.
 *
 * @param onOutput Called with the latest complete line of install output
 *   (non-verbose only) so the caller can show it as live activity.
 * @returns A Promise that resolves once the installation is finished.
 *   On failure it rejects with an `Error` whose message includes the command,
 *   the exit code, and the tail of the captured output.
 */
export function install(
  packageManager: PackageManager,
  verboseOutput: boolean,
  onOutput?: (line: string) => void
): Promise<void> {
  const args = [
    'install',
    ...(verboseOutput ? [] : (STREAM_FLAGS[packageManager] ?? [])),
  ];
  // Error messages show the plain command, not our internal stream flag.
  const command = `${packageManager} install`;

  return new Promise((resolve, reject) => {
    // Verbose: inherit. Otherwise pipe both streams for live activity and the
    // error tail; npm logs to stderr, pnpm and yarn to stdout, so both are needed.
    const child = spawn(packageManager, args, {
      stdio: verboseOutput ? 'inherit' : ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ADBLOCK: '1',
        DISABLE_OPENCOLLECTIVE: '1',
        // Non-verbose: force plain text so captured lines carry no color codes.
        ...(verboseOutput ? {} : { NO_COLOR: '1' }),
      },
    });

    let captured = '';
    let pending = '';
    const onChunk = (chunk: Buffer) => {
      const text = chunk.toString();
      captured = (captured + text).slice(-MAX_OUTPUT_CHARS);
      if (!onOutput) return;
      // Buffer across chunks so we only ever surface a complete line, never a
      // fragment split at a chunk boundary.
      pending += text;
      const lines = pending.split(/[\r\n]+/);
      pending = lines.pop() ?? '';
      const line = lines
        .map((l) => l.trim())
        .filter(Boolean)
        .pop();
      if (line) onOutput(line);
    };
    child.stdout?.on('data', onChunk);
    child.stderr?.on('data', onChunk);

    // e.g. the package manager binary isn't on PATH.
    child.on('error', (err) => {
      reject(
        new Error(`Failed to run "${command}": ${(err as Error).message}`)
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

      reject(new Error(message));
    });
  });
}
