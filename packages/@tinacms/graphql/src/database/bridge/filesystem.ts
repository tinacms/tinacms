import path from 'path';
import fg from 'fast-glob';
import fs from 'fs-extra';
import normalize from 'normalize-path';
import type { Bridge } from './index';

/**
 * Defense-in-depth: validates that a filepath stays within a base directory.
 * This protects against CWE-22 (Path Traversal) even if callers fail to
 * sanitize user input before calling bridge methods.
 *
 * @security This is a local copy of the validation pattern. The canonical
 * reference is in `@tinacms/cli/src/utils/path.ts`. Unlike the media-model
 * copies, this one does NOT include the URL-encoded safety net because
 * bridge paths come from GraphQL, not raw HTTP URLs.
 *
 * @param filepath - The path to validate (relative to baseDir).
 * @param baseDir  - The trusted root directory.
 * @returns The resolved absolute path.
 * @throws {Error} If the path escapes the base directory.
 */
function assertWithinBase(filepath: string, baseDir: string): string {
  const resolvedBase = path.resolve(baseDir);
  const resolved = path.resolve(path.join(baseDir, filepath));
  if (
    resolved !== resolvedBase &&
    !resolved.startsWith(resolvedBase + path.sep)
  ) {
    throw new Error(
      `Path traversal detected: "${filepath}" escapes the base directory`
    );
  }
  return resolved;
}

/**
 * This is the bridge from whatever datasource we need for I/O.
 * The basic example here is for the filesystem, one is needed
 * for GitHub has well.
 *
 * @security All public methods validate their `filepath` / `pattern`
 * argument via `assertWithinBase` before performing any I/O. If you add a
 * new method that accepts a path, you MUST validate it the same way.
 */
export class FilesystemBridge implements Bridge {
  public rootPath: string;
  public outputPath: string;

  constructor(rootPath: string, outputPath?: string) {
    this.rootPath = path.resolve(rootPath);
    this.outputPath = outputPath ? path.resolve(outputPath) : this.rootPath;
  }

  public async glob(pattern: string, extension: string) {
    const basePath = assertWithinBase(pattern, this.outputPath);
    const items = await fg(
      path.join(basePath, '**', `/*\.${extension}`).replace(/\\/g, '/'),
      {
        dot: true,
        ignore: ['**/node_modules/**'],
      }
    );
    const posixRootPath = normalize(this.outputPath);
    return items.map((item) =>
      item.substring(posixRootPath.length).replace(/^\/|\/$/g, '')
    );
  }

  public async delete(filepath: string) {
    const resolved = assertWithinBase(filepath, this.outputPath);
    await fs.remove(resolved);
  }

  public async get(filepath: string) {
    const resolved = assertWithinBase(filepath, this.outputPath);
    return (await fs.readFile(resolved)).toString();
  }

  public async put(filepath: string, data: string, basePathOverride?: string) {
    const basePath = basePathOverride || this.outputPath;
    const resolved = assertWithinBase(filepath, basePath);
    await fs.outputFile(resolved, data);
  }
}

/**
 * Same as the `FileSystemBridge` except it does not save files
 */
export class AuditFileSystemBridge extends FilesystemBridge {
  public async put(filepath: string, data: string) {
    if (
      [
        '.tina/__generated__/_lookup.json',
        '.tina/__generated__/_schema.json',
        '.tina/__generated__/_graphql.json',
        'tina/__generated__/_lookup.json',
        'tina/__generated__/_schema.json',
        'tina/__generated__/_graphql.json',
      ].includes(filepath)
    ) {
      return super.put(filepath, data);
    }
    return;
  }
}
