/**

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
    title: 'Hugo Starter',
    value: 'tina-hugo-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-hugo-starter',
  },
  {
    title: 'Remix Starter',
    value: 'tina-remix-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-remix-starter',
  },
  {
    title: 'Docusaurus Starter',
    value: 'tinasaurus',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tinasaurus',
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
