import { markdown, danger, warn, message } from 'danger'

runChecksOnPullRequest()

/**
 * An object representing a package in tinacms/tinacms.
 */
interface TinaPackage {
  /**
   * The path to the package in the repo.
   */
  path: string

  /**
   * The contents of it's `package.json`.
   */
  packageJson: any
}

/**
 * Executes all checks for the Pull Request.
 */
function runChecksOnPullRequest() {
  const allFiles = [
    ...danger.git.created_files,
    ...danger.git.deleted_files,
    ...danger.git.modified_files,
  ]

  let modifiedPackages = getModifiedPackages(allFiles)

  modifiedPackages.forEach(p => {
    warnIfMissingChangelogEntry(p)
    warnIfMissingTestChanges(p)
  })

  listTouchedPackages(modifiedPackages)
  listTouchedWorkflows(allFiles)
}

/**
 * Example Output:
 * ```
 * ### Modified Github Workflows
 *
 * * .github/workflows/danger.yml
 * ```
 */
function listTouchedWorkflows(allFiles: string[]) {
  let touchedWorkflows = allFiles.filter(filepath =>
    filepath.startsWith('.github/workflows/')
  )
  if (touchedWorkflows.length === 0) return

  message(`### Modified Github Workflows

* ${touchedWorkflows.join('\n* ')}`)
}

/**
 * Example Output:
 * ```
 * ### Modified Packages
 *
 * * `@tinacms/fields`
 * * `react-tinacms`
 * ```
 */
function listTouchedPackages(modifiedPackages: TinaPackage[]) {
  if (!modifiedPackages.length) return
  markdown(`### Modified Packages

The following packages were modified by this pull request:

* ${modifiedPackages
    .map(({ packageJson }) => `\`${packageJson.name}\``)
    .join('\n* ')}`)
}

/**
 * Example Output:
 * ```
 * `@tinacms/core` may need a CHANGELOG entry.
 * ```
 */
function warnIfMissingChangelogEntry({ path, packageJson }: TinaPackage) {
  const hasCHANGELOGChanges = !!danger.git.modified_files.find(
    p => p === `${path}/CHANGELOG.md`
  )
  if (!hasCHANGELOGChanges) {
    warn(`\`${packageJson.name}\` may need a CHANGELOG entry.`)
  }
}

/**
 * Example Output:
 *
 * ```
 * `@tinacms/core` may need new tests.
 * ```
 */
function warnIfMissingTestChanges({ path, packageJson }: TinaPackage) {
  const hasCHANGELOGChanges = !!danger.git.modified_files.find(p =>
    p.match(/.*.test.tsx?/)
  )
  if (!hasCHANGELOGChanges) {
    warn(`\`${packageJson.name}\` may need new tests.`)
  }
}

/**
 * Lists all packages modified by this PR.
 */
function getModifiedPackages(allFiles: string[]) {
  let packageList: TinaPackage[] = []
  let paths = new Set(
    allFiles
      .filter(filepath => filepath.startsWith('packages/'))
      .filter(filepath => !filepath.startsWith('packages/demo'))
      .map(filepath =>
        filepath
          .split('/')
          .slice(0, 3)
          .join('/')
      )
  )

  paths.forEach(path => {
    let packageJson = require(`./${path}/package.json`)

    packageList.push({
      path,
      packageJson,
    })
  })
  return packageList
}
