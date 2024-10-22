import { downloadAndExtractRepo, getRepoInfo } from './util/examples'
import { copy } from 'fs-extra'
import path from 'path'
import { log, TextStyles } from './util/logger'

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

export async function downloadTemplate(template: Template, root: string) {
  if (template.isInternal === false) {
    const repoURL = new URL(template.gitURL)
    const repoInfo = await getRepoInfo(repoURL)
    if (!repoInfo) {
      throw new Error('Repository information not found.')
    }

    log.info(
      `Downloading files from repo ${TextStyles.link(
        `${repoInfo?.username}/${repoInfo?.name}`
      )}.`
    )
    await downloadAndExtractRepo(root, repoInfo)
  } else {
    // Copy the template from the local file system.
    const templateFile = path.join(__dirname, '..', 'examples', template.value)
    await copy(`${templateFile}/`, './')
  }
}
