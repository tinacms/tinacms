import { downloadAndExtractRepo, getRepoInfo } from './util/examples'
import chalk from 'chalk'
import { copy } from 'fs-extra'
import path from 'path'

type BaseExample = {
  title: string
  description?: string
  value: string
}

export type InternalTemplate = BaseExample & {
  isInternal: true
}
export type ExternalTemplate = BaseExample & {
  isInternal: false
  gitURL: string
}
export type Template = InternalTemplate | ExternalTemplate

export const TEMPLATES: Template[] = [
  {
    title: '⭐ NextJS starter',
    description:
      'Kickstart your project with NextJS – our top recommendation for a seamless, performant, and versatile web experience.',
    value: 'tina-cloud-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-cloud-starter',
  },
  {
    title: 'Hugo Starter',
    description:
      'With Hugo, you wield the power of lightning-fast site generation, crafting web experiences at the speed of thought.',
    value: 'tina-hugo-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-hugo-starter',
  },
  {
    title: 'Remix Starter',
    description:
      'Dive into Remix to orchestrate seamless, interactive user journeys like a maestro of the web.',
    value: 'tina-remix-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-remix-starter',
  },
  {
    title: 'Documentation Starter',
    description:
      'Transform documentation with Smooth Doc: Features MDX support, light/dark mode, and seamless Vercel deployment for a dynamic, interactive experience.',
    value: 'demo-docs',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/demo-docs',
  },
  {
    title: 'Docusaurus Starter',
    description:
      'Docusaurus empowers you to build and evolve documentation like crafting a living, breathing knowledge repository.',
    value: 'tinasaurus',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tinasaurus',
  },
  {
    title: 'Bare bones starter',
    description:
      'Stripped down to essentials, this starter is the canvas for pure, unadulterated code creativity.',
    value: 'basic',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-barebones-starter',
  },
]

export const downloadTemplate = async (template: Template, root: string) => {
  if (template.isInternal === false) {
    // Make a github URL
    const repoURL = new URL(template.gitURL)
    // Download the Repo
    const repoInfo = await getRepoInfo(repoURL)
    const repoInfo2 = repoInfo
    console.log(
      `Downloading files from repo ${chalk.cyan(
        `${repoInfo?.username}/${repoInfo?.name}`
      )}. This might take a moment.`
    )

    if (!repoInfo2) {
      throw new Error('downloadExample Failed. Repo info not found')
    }

    await downloadAndExtractRepo(root, repoInfo2)
  } else {
    // need to copy the template from local file system
    const templateFile = path.join(__dirname, '..', 'examples', template.value)
    await copy(`${templateFile}/`, './')
  }
}
