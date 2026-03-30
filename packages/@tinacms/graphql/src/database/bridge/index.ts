/**
 * I/O abstraction layer for reading/writing content files.
 *
 * @security **Path traversal (CWE-22):** All `filepath` and `pattern`
 * parameters may originate from user input (e.g. GraphQL mutations or media
 * API requests). Implementations MUST validate that resolved paths stay
 * within their root/output directory before performing any filesystem
 * operation. See `FilesystemBridge.assertWithinBase` and
 * `IsomorphicBridge.assertWithinBase` for reference implementations.
 *
 * The recommended validation pattern is:
 * ```ts
 * const resolved = path.resolve(path.join(baseDir, filepath));
 * if (!resolved.startsWith(path.resolve(baseDir) + path.sep)) {
 *   throw new Error('Path traversal detected');
 * }
 * ```
 *
 * If you are adding a new Bridge implementation, add path traversal
 * validation to every method that accepts a filepath from the caller.
 */
export interface Bridge {
  rootPath: string;
  /**
   * @param pattern   - Glob pattern prefix (untrusted — validate before use).
   * @param extension - File extension to match.
   */
  glob(pattern: string, extension: string): Promise<string[]>;
  /** @param filepath - Relative path to delete (untrusted — validate before use). */
  delete(filepath: string): Promise<void>;
  /** @param filepath - Relative path to read (untrusted — validate before use). */
  get(filepath: string): Promise<string>;
  /** @param filepath - Relative path to write (untrusted — validate before use). */
  put(filepath: string, data: string): Promise<void>;
  /**
   * Optionally, the bridge can perform
   * operations in a separate path.
   */
  outputPath?: string;
}
