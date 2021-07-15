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

import { markdown, danger, warn, fail, message } from 'danger'
import * as fs from 'fs'
import * as path from 'path'

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

const licenseIgnoreList = [
  '.pnp.js',
  'apps/demo/.tina/__generated__/types.ts',
  'apps/test/.tina/__generated__/types.ts',
  'examples/tina-cloud-starter/.tina/__generated__/types.ts',
  'examples/tina-cloud-starter-experimental/.tina/__generated__/types.ts',
  'examples/tina-tailwind-sidebar-demo/.tina/__generated__/types.ts',
]

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
function runChecksOnPullRequest() {
  const allFiles = [
    ...danger.git.created_files,
    ...danger.git.deleted_files,
    ...danger.git.modified_files,
  ]

  // Check for License Headers
  allFiles.filter(fileNeedsLicense).forEach(checkFileForLicenseHeader)
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
  return new RegExp(/\.(js|tsx?)$/).test(filepath)
}

/**
 *
 */
function checkFileForLicenseHeader(filepath: string) {
  try {
    if (licenseIgnoreList.includes(filepath)) return

    const content = fs.readFileSync(path.resolve(`./${filepath}`), {
      encoding: 'utf8',
    })

    if (isMissingHeader(content)) {
      fail(`${filepath} is missing the license header`)
    }
  } catch {
    // The file was deleted. That's okay.
  }
}

function isMissingHeader(content: string) {
  for (const line of LICENSE_HEADER) {
    if (!content.includes(line)) {
      return true
    }
  }
}
