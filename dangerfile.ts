/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

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

  modifiedPackages.forEach(warnIfMissingTestChanges)

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
 *
 * ```
 * `@tinacms/core` may need new tests.
 * ```
 */
function warnIfMissingTestChanges({ path, packageJson }: TinaPackage) {
  const hasTestChanges = !!danger.git.modified_files.find(p =>
    p.match(/.*.test.tsx?/)
  )
  if (!hasTestChanges) {
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
      .map(filepath => {
        // packages/react-tinacms
        // packages/@tinacms/core
        if (filepath.startsWith('packages/@tinacms')) {
          return filepath
            .split('/')
            .slice(0, 3)
            .join('/')
        }
        return filepath
          .split('/')
          .slice(0, 2)
          .join('/')
      })
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
