export interface Bridge {
  rootPath: string
  glob(path: string, extension: string, match?: string): Promise<string[]>
  delete(filepath: string): Promise<void>
  get(filepath: string): Promise<string>
  put(filepath: string, data: string): Promise<void>
  /**
   * Whether this bridge supports the ability to build the schema.
   */
  supportsBuilding(): boolean
  putConfig(filepath: string, data: string): Promise<void>
  /**
   * Optionally, the bridge can perform
   * operations in a separate path.
   */
  outputPath?: string
  addOutputPath?(outputPath: string): void
}
