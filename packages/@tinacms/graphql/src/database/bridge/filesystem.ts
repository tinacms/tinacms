import fs from 'fs-extra'
import fg from 'fast-glob'
import path from 'path'
import normalize from 'normalize-path'
import type { Bridge } from './index'

/**
 * This is the bridge from whatever datasource we need for I/O.
 * The basic example here is for the filesystem, one is needed
 * for GitHub has well.
 */
export class FilesystemBridge implements Bridge {
  public rootPath: string
  public outputPath?: string
  constructor(rootPath: string, outputPath?: string) {
    this.rootPath = rootPath || ''
    this.outputPath = outputPath || rootPath
  }
  public async glob(pattern: string, extension: string) {
    const basePath = path.join(this.outputPath, ...pattern.split('/'))
    const items = await fg(
      path.join(basePath, '**', `/*\.${extension}`).replace(/\\/g, '/'),
      {
        dot: true,
        ignore: ['**/node_modules/**'],
      }
    )
    const posixRootPath = normalize(this.outputPath)
    return items.map((item) => {
      return item.replace(posixRootPath, '').replace(/^\/|\/$/g, '')
    })
  }
  public async delete(filepath: string) {
    await fs.remove(path.join(this.outputPath, filepath))
  }
  public async get(filepath: string) {
    return fs.readFileSync(path.join(this.outputPath, filepath)).toString()
  }
  public async put(filepath: string, data: string, basePathOverride?: string) {
    const basePath = basePathOverride || this.outputPath
    await fs.outputFileSync(path.join(basePath, filepath), data)
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
      return super.put(filepath, data)
    }
    return
  }
}
