import { downloadAndExtractRepo, getRepoInfo } from './util/examples'
import chalk from 'chalk'
import { cpSync } from 'fs'

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
  { title: 'Basic', value: 'basic', isInternal: true },
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
    title: 'Tailwind Site Builder',
    value: 'tina-tailwind-sidebar-demo',
    isInternal: true,
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
    cpSync(`../examples/${example.value}`, './')
  }
}
