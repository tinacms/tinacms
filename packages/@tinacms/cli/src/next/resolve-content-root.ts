import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { z } from 'zod';
import { logger } from '../logger';
import { stripNativeTrailingSlash } from '../utils/path';

const localContentPathSchema = z.string().min(1).optional();

/**
 * Resolves the content root directory for a Tina project.
 *
 * - Single-repo (no `localContentPath`): returns `rootPath`.
 * - Multi-repo with `localContentPath` set and the joined directory present:
 *   returns the joined absolute path and logs an info message.
 * - Multi-repo with `localContentPath` set but the joined directory missing:
 *   logs a warning citing the config file and falls back to `rootPath`.
 *
 * Extracted from ConfigManager for unit testing. The CLI's ConfigManager
 * cannot be imported from a jest unit test because it uses `import.meta.url`
 * at module scope, which CommonJS-targeted ts-jest cannot parse.
 */
export async function resolveContentRootPath(params: {
  rootPath: string;
  tinaFolderPath: string;
  tinaConfigFilePath: string;
  localContentPath: unknown;
}): Promise<string> {
  const localContentPath = localContentPathSchema.parse(
    params.localContentPath
  );
  if (!localContentPath) {
    return params.rootPath;
  }
  const fullLocalContentPath = stripNativeTrailingSlash(
    path.join(params.tinaFolderPath, localContentPath)
  );
  const exists = await fs.pathExists(fullLocalContentPath);
  if (exists) {
    logger.info(`Using separate content repo at ${fullLocalContentPath}`);
    return fullLocalContentPath;
  }
  logger.warn(
    `${chalk.yellow('Warning:')} The localContentPath ${chalk.cyan(
      fullLocalContentPath
    )} does not exist. Please create it or remove the localContentPath from your config file at ${chalk.cyan(
      params.tinaConfigFilePath
    )}`
  );
  return params.rootPath;
}
