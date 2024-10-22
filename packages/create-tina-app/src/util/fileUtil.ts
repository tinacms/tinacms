import fs from 'fs-extra'
import path from 'path'
import { log, TextStyles } from './logger'

export async function isWriteable(directory: string): Promise<boolean> {
  try {
    // @ts-ignore
    await fs.promises.access(directory, (fs.constants || fs).W_OK)
    return true
  } catch (err) {
    return false
  }
}

export function folderContainsInstallConflicts(root: string): string[] {
  const validFiles = [
    '.DS_Store',
    '.git',
    '.gitattributes',
    '.gitignore',
    '.gitlab-ci.yml',
    '.hg',
    '.hgcheck',
    '.hgignore',
    '.idea',
    '.npmignore',
    '.travis.yml',
    'LICENSE',
    'Thumbs.db',
    'docs',
    'mkdocs.yml',
    'npm-debug.log',
    'yarn-debug.log',
    'yarn-error.log',
  ]

  const conflicts = fs
    .readdirSync(root)
    .filter((file) => !validFiles.includes(file))
    // Support IntelliJ IDEA-based editors
    .filter((file) => !/\.iml$/.test(file))

  return conflicts
}

export async function setupProjectDirectory(dir: string): Promise<string> {
  const appName = path.basename(dir)

  await fs.mkdirp(dir)
  process.chdir(dir)

  const conflicts = folderContainsInstallConflicts(dir)
  if (conflicts.length > 0) {
    log.err(
      `The directory '${TextStyles.bold(
        appName
      )}' contains files that could conflict. Below is a list of conflicts, please remove them and try again.`
    )
    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(dir, file))
        if (stats.isDirectory()) {
          log.log(`-  ${TextStyles.info(file)}/`)
        } else {
          log.log(`-  ${file}`)
        }
      } catch {
        log.log(`-  ${file}`)
      }
    }

    process.exit(1)
  }

  return appName
}

export function updateProjectPackageName(dir: string, name: string) {
  const packageJsonPath = path.join(dir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  packageJson.name = name
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

export function updateProjectPackageVersion(dir: string, version: string) {
  const packageJsonPath = path.join(dir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  packageJson.version = version
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
}
