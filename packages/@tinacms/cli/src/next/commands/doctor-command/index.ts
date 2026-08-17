import { Command, Option } from 'clipanion';

import { logger } from '../../../logger';
import {
  checkTinaDependencies,
  fetchLatestVersion,
  formatDoctorTable,
  getTinaDependencies,
  readProjectPackageJson,
  resolveInstalledVersions,
} from './doctor';

export class DoctorCommand extends Command {
  static paths = [['doctor']];

  rootPath = Option.String('--rootPath', {
    description:
      'Specify the root directory to inspect (defaults to current working directory)',
  });
  json = Option.Boolean('--json', false, {
    description: 'Print machine-readable JSON output',
  });
  timeout = Option.String('--timeout', '5000', {
    description: 'npm registry request timeout in milliseconds',
  });

  static usage = Command.Usage({
    category: 'Commands',
    description: 'Check direct TinaCMS dependencies against npm latest',
  });

  async catch(error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error occurred during tinacms doctor: ${message}`);
    process.exit(1);
  }

  async execute(): Promise<number | void> {
    const rootPath = this.rootPath || process.cwd();
    const timeoutMs = Number(this.timeout);
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      logger.error('--timeout must be a positive number');
      return 1;
    }

    const packageJson = await readProjectPackageJson(rootPath);
    const dependencies = await resolveInstalledVersions({
      rootPath,
      dependencies: getTinaDependencies(packageJson),
    });
    const results = await checkTinaDependencies({
      dependencies,
      fetchLatest: (name) => fetchLatestVersion(name, timeoutMs),
    });

    if (this.json) {
      logger.info(JSON.stringify({ rootPath, results }, null, 2));
    } else if (results.length === 0) {
      logger.info('No direct TinaCMS dependencies found.');
    } else {
      logger.info(formatDoctorTable(results));
    }

    const hasOutdated = results.some((result) => result.status === 'outdated');
    const hasUnknown = results.some((result) => result.status === 'unknown');
    return hasOutdated || hasUnknown ? 1 : 0;
  }
}
