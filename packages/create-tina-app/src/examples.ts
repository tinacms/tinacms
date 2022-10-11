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

import { downloadAndExtractRepo, getRepoInfo } from './util/examples'
import chalk from 'chalk'
import { copy } from 'fs-extra'
import path from 'path'

type BaseExample = {
  title: string
  value: string
}

export type InternalExample = BaseExample & {
  isInternal: true
}
export type ExternalExample = BaseExample & {
  isInternal: false
  gitURL: string
}
export type Example = InternalExample | ExternalExample

export const EXAMPLES: Example[] = [
  {
    title: 'Bare bones starter',
    value: 'basic',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-barebones-starter',
  },
  {
    title: 'Tailwind Starter',
    value: 'tina-cloud-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-cloud-starter',
  },
  {
    title: 'Documentation Starter',
    value: 'tina-docs-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-docs-starter',
  },
  {
    title: 'Hugo Starter',
    value: 'tina-hugo-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-hugo-starter',
  },
]

export const downloadExample = async (example: Example, root: string) => {
  if (example.isInternal === false) {
    // need to download example from github

    // Make a github URL
    const repoURL = new URL(example.gitURL)
    // Download the Repo
    const repoInfo = await getRepoInfo(repoURL)
    const repoInfo2 = repoInfo
    console.log(
      `Downloading files from repo ${chalk.cyan(
        repoInfo.username + '/' + repoInfo.name
      )}. This might take a moment.`
    )

    await downloadAndExtractRepo(root, repoInfo2)
  } else {
    // need to copy the example from local file system
    const exampleFile = path.join(__dirname, '..', 'examples', example.value)
    await copy(`${exampleFile}/`, './')
  }
}
