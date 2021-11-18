/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import { markdown, danger, warn, fail, message, GitHubPRDSL } from 'danger'
import * as fs from 'fs'
import * as path from 'path'
import { Buffer } from 'buffer'

const LICENSE_HEADER: string[] = [
  `Copyright 2021 Forestry.io Holdings, Inc.`,
  `Licensed under the Apache License, Version 2.0 (the "License");`,
  `you may not use this file except in compliance with the License.`,
  `You may obtain a copy of the License at`,
  `http://www.apache.org/licenses/LICENSE-2.0`,
  `Unless required by applicable law or agreed to in writing, software`,
  `distributed under the License is distributed on an "AS IS" BASIS,`,
  `WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.`,
  `See the License for the specific language governing permissions and`,
  `limitations under the License.`,
]

async function getLocalFileContents(filepath: string) {
  return fs.readFileSync(path.resolve(`./${filepath}`), {
    encoding: 'utf8',
  })
}

interface GithubDraftablePRDSL extends GitHubPRDSL {
  draft: Boolean
}

async function getRemoteFileContents(filepath: string) {
  const octokit = danger.github.api
  const pr = danger.github.pr as GithubDraftablePRDSL
  const refType = pr.draft ? 'head' : 'merge'
  const { data }: any = await octokit.repos.getContents({
    owner: 'tinacms',
    repo: 'tinacms',
    path: filepath,
    ref: `refs/pull/${danger.github.thisPR.number}/${refType}`,
  })
  return Buffer.from(data.content, 'base64').toString()
}

async function getFileContents(filepath: string) {
  if (!danger.github) {
    return getLocalFileContents(filepath)
  } else {
    return getRemoteFileContents(filepath)
  }
}

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
  packageJson: {
    name: string
    scripts: {
      dev: string
      build: string
      watch: string
    }
    license: string
    dependencies?: { [key: string]: string }
    devDependencies?: { [key: string]: string }
  }
}

/**
 * Executes all checks for the Pull Request.
 */
async function runChecksOnPullRequest() {
  const allFiles = [
    ...danger.git.created_files,
    ...danger.git.deleted_files,
    ...danger.git.modified_files,
  ]
  const existingFiles = [
    ...danger.git.created_files,
    ...danger.git.modified_files,
  ]

  // Files
  await existingFiles
    .filter(fileNeedsLicense)
    .forEach(checkFileForLicenseHeader)

  // Packages
  const modifiedPackages = await getModifiedPackages(allFiles)

  modifiedPackages.forEach(checkForNpmScripts)
  modifiedPackages.forEach(checkForLicense)

  modifiedPackages.forEach((pkg) => checkForReadmeChanges(pkg, allFiles))

  listTouchedPackages(modifiedPackages)

  // Github Actions Workflows
  listTouchedWorkflows(allFiles)
}

function checkForReadmeChanges(pkg: TinaPackage, allFiles: string[]) {
  const packageFiles = allFiles.filter((file) => file.startsWith(pkg.path))

  const hasReadme = packageFiles.find((file) => file.endsWith('README.md'))

  if (!hasReadme) {
    warn(
      `\`${pkg.path}\` was modified but its README.md was not updated. Please check if any changes should be reflected in the documentation.`
    )
  }
}

interface Dep {
  file: string
  details: string
}

/**
 * Example Output:
 * ```
 * ### Modified Github Workflows
 *
 * * .github/workflows/main.yml
 * * dangerfile.ts
 * ```
 */
function listTouchedWorkflows(allFiles: string[]) {
  const touchedWorkflows = allFiles.filter(
    (filepath) =>
      filepath.startsWith('.github/workflows/') ||
      filepath.endsWith('dangerfile.ts')
  )
  if (touchedWorkflows.length === 0) return

  message(`### Modified CI Scripts

* ${touchedWorkflows.join('\n* ')}`)
}

/**
 *
 */
function checkForNpmScripts({ packageJson }: TinaPackage) {
  if (packageJson.name === '@tinacms/scripts') {
    return
  }
  const scripts = packageJson.scripts || {}

  const requiredScripts: (keyof TinaPackage['packageJson']['scripts'])[] = [
    'build',
  ]

  requiredScripts.forEach((scriptName) => {
    if (!scripts[scriptName]) {
      fail(`${packageJson.name} is missing a required script: ${scriptName}`)
    }
  })
}

/**
 *
 */
function checkForLicense({ packageJson }: TinaPackage) {
  const license = 'Apache-2.0'
  if (packageJson.license !== license) {
    fail(`${packageJson.name} package.json is missing the license: ${license}`)
  }
}

/**
 *
 */
function fileNeedsLicense(filepath: string) {
  if (filepath === '.pnp.js') return false
  if (filepath.startsWith('.yarn')) return false
  return new RegExp(
    /^(?!(examples|experimental-examples)\/).+\.(jsx?|tsx?)$/
  ).test(filepath)
}

/**
 *
 */
async function checkFileForLicenseHeader(filepath: string) {
  try {
    const content = await getFileContents(filepath)

    if (isMissingHeader(content)) {
      fail(`${filepath} is missing the license header`)
    }
  } catch (e) {
    fail(e.message)
  }
}

function isMissingHeader(content: string) {
  for (const line of LICENSE_HEADER) {
    if (!content.includes(line)) {
      return true
    }
  }
}

/**
 * Example Output:
 * ```
 * ### Modified Packages
 *
 * * `@tinacms/fields`
 * * `react-tinacms-github`
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
 * Lists all packages modified by this PR.
 */
async function getModifiedPackages(allFiles: string[]) {
  const packageList: TinaPackage[] = []
  const paths = new Set(
    allFiles
      .filter((filepath) => filepath.startsWith('packages/'))
      .filter((filepath) => !filepath.startsWith('packages/demo'))
      .filter((filepath) => !filepath.startsWith('packages/@testing'))
      /**
       * These are all the old directory groups.
       * For some reason they still exist in Github, even
       * though they can't be found. This is causing the danger
       * build to fail. Technology, amirite?
       */
      .filter((filepath) => !filepath.startsWith('packages/api/'))
      .filter((filepath) => !filepath.startsWith('packages/next/'))
      .filter((filepath) => !filepath.startsWith('packages/react/'))
      .filter((filepath) => !filepath.startsWith('packages/gatsby/'))
      .filter((filepath) => !filepath.startsWith('packages/core/'))
      .map((filepath) => {
        if (filepath.startsWith('packages/@tinacms')) {
          return filepath.split('/').slice(0, 3).join('/')
        }
        return filepath.split('/').slice(0, 2).join('/')
      })
  )

  const pathArray = Array.from(paths) // typescript doesn't like iterables
  for (let path of pathArray) {
    try {
      // get file contents + JSON decode
      await getFileContents(`${path}/package.json`)
        .then(JSON.parse)
        .then((packageJson) => {
          packageList.push({
            path,
            packageJson,
          })
        })
    } catch (e) {
      warn(`Could not find package: ${path}: ${e.message}`)
    }
  }

  return packageList
}
