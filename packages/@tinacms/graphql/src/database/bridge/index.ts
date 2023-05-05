export interface Bridge {
  rootPath: string
  glob(pattern: string, extension: string): Promise<string[]>
  delete(filepath: string): Promise<void>
  get(filepath: string): Promise<string>
  put(filepath: string, data: string): Promise<void>
  /**
   * Optionally, the bridge can perform
   * operations in a separate path.
   */
  outputPath?: string
}
