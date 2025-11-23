import { downloadAndExtractRepo, getRepoInfo } from './util/examples';
import { copy } from 'fs-extra';
import path from 'path';
import { TextStyles } from './util/textstyles';
import { Ora } from 'ora';

export type BaseExample = {
  title: string;
  description?: string;
  value: string;
  devUrl: string;
};

export type InternalTemplate = BaseExample & {
  isInternal: true;
};
export type ExternalTemplate = BaseExample & {
  isInternal: false;
  gitURL: string;
};
export type Template = InternalTemplate | ExternalTemplate;

export const TEMPLATES: Template[] = [
  {
    title: '⭐ NextJS starter',
    description:
      'Kickstart your project with Next.js – our top recommendation for a seamless, performant, and versatile web experience.',
    value: 'tina-nextjs-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-nextjs-starter',
    devUrl: 'http://localhost:3000',
  },
  {
    title: '⭐️ TinaDocs',
    description:
      'Get your documentation site up and running with TinaCMS and Next.js in minutes.',
    value: 'tina-docs',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-docs',
    devUrl: 'http://localhost:3000',
  },
  {
    title: 'Astro Starter',
    description:
      'Get started with Astro - a modern static site generator designed for fast, lightweight, and flexible web projects.',
    value: 'tina-astro-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-astro-starter',
    devUrl: 'http://localhost:4321',
  },
  {
    title: 'Hugo Starter',
    description:
      'With Hugo, you wield the power of lightning-fast site generation, crafting web experiences at the speed of thought.',
    value: 'tina-hugo-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-hugo-starter',
    devUrl: 'http://localhost:1313',
  },
  {
    title: 'Remix Starter',
    description:
      'Dive into Remix to orchestrate seamless, interactive user journeys like a maestro of the web.',
    value: 'tina-remix-starter',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-remix-starter',
    devUrl: 'http://localhost:3000',
  },
  {
    title: 'Docusaurus Starter',
    description:
      'Docusaurus empowers you to build and evolve documentation like crafting a living, breathing knowledge repository.',
    value: 'tinasaurus',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tinasaurus',
    devUrl: 'http://localhost:3000',
  },
  {
    title: 'Bare bones starter',
    description:
      'Stripped down to essentials, this starter is the canvas for pure, unadulterated code creativity.',
    value: 'basic',
    isInternal: false,
    gitURL: 'https://github.com/tinacms/tina-barebones-starter',
    devUrl: 'http://localhost:3000',
  },
];

export async function downloadTemplate(
  template: Template,
  root: string,
  spinner: Ora
) {
  if (template.isInternal === false) {
    const repoURL = new URL(template.gitURL);
    const repoInfo = await getRepoInfo(repoURL);
    if (!repoInfo) {
      throw new Error('Repository information not found.');
    }

    spinner.text = `Downloading files from repo ${TextStyles.tinaOrange(
      `${repoInfo?.username}/${repoInfo?.name}`
    )}`;
    await downloadAndExtractRepo(root, repoInfo);
  } else {
    // Copy the template from the local file system.
    const templateFile = path.join(__dirname, '..', 'examples', template.value);
    await copy(`${templateFile}/`, './');
  }
}
