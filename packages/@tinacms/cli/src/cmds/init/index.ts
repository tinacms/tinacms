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
import path from 'path'
import { format } from 'prettier'
import {
  cmdText,
  focusText,
  indentedCmd,
  linkText,
  logText,
  titleText,
} from '../../utils/theme'
import { logger } from '../../logger'
import fs from 'fs-extra'
import prompts from 'prompts'
import { Telemetry } from '@tinacms/metrics'
import { nextPostPage } from './setup-files'
import { extendNextScripts } from '../../utils/script-helpers'
import { configExamples } from './setup-files/config'
import { hasForestryConfig } from '../forestry-migrate/util'
import { generateCollections } from '../forestry-migrate'
import { readme } from './setup-files/readme'

export interface Framework {
  name: 'next' | 'hugo' | 'jekyll' | 'other'
  reactive: boolean
}

export async function initStaticTina(args: {
  context: { rootPath: string; tinaDirectory: string }
  options: { noTelemetry?: boolean }
}) {
  const baseDir = args.context.rootPath
  logger.level = 'info'

  // Choose your ClientID
  const clientId = await chooseClientId()

  let token: string | null = null
  // Choose your Read Only token
  if (clientId) {
    token = await chooseToken({ clientId })
  }

  // Choose package manager
  const packageManager = await choosePackageManager()

  // Choose framework
  const framework: Framework = await chooseFramework()

  // Choose typescript
  const usingTypescript = await chooseTypescript()

  // Choose public folder
  const publicFolder: string = await choosePublicFolder({ framework })

  // Detect forestry config
  const forestryPath = await hasForestryConfig({
    rootPath: args.context.rootPath,
  })

  let collections: string | null | undefined

  // If there is a forestry config, ask user to migrate it to tina collections
  if (forestryPath.exists) {
    collections = await forestryMigrate({
      forestryPath: forestryPath.path,
      rootPath: args.context.rootPath,
    })
  }

  // Report telemetry
  await reportTelemetry({
    usingTypescript,
    hasForestryConfig: forestryPath.exists,
    noTelemetry: args.options.noTelemetry,
  })

  // Check for package.json
  const hasPackageJSON = await fs.pathExistsSync('package.json')
  // if no package.json, init
  if (!hasPackageJSON) {
    await createPackageJSON()
  }

  await createOrAppendToGitignore(baseDir, ['node_modules'])
  await addDependencies(packageManager)

  await addConfigFile({
    publicFolder,
    baseDir,
    tinaDirectory: args.context.tinaDirectory,
    usingTypescript,
    framework,
    collections,
    token,
    clientId,
  })

  await addReadMeFile({
    baseDir,
    tinaDirectory: args.context.tinaDirectory,
  })

  await createOrAppendToGitignore(
    path.join(args.context.rootPath, args.context.tinaDirectory),
    ['__generated__']
  )

  if (!forestryPath.exists) {
    // add /content/posts/hello-world.md
    await addContentFile({ baseDir })
  }

  if (framework.reactive) {
    await addReactiveFile[framework.name]({
      baseDir,
      framework,
      usingTypescript,
    })
  }

  logNextSteps({ packageManager, framework })
}

const chooseClientId = async () => {
  const option = await prompts({
    name: 'clientId',
    type: 'text',
    message: `What is your Tina Cloud Client ID? (Hit enter to skip and set up yourself later)\n${logText(
      "Don't have a Client ID? Create one here: "
    )}${linkText('https://app.tina.io/projects/new')}`,
  })
  return option['clientId'] as string
}

const chooseToken = async ({ clientId }: { clientId: string }) => {
  const option = await prompts({
    name: 'token',
    type: 'text',
    message: `What is your Tina Cloud Read Only Token?\n${logText(
      "Don't have a Read Only Token? Create one here: "
    )}${linkText(`https://app.tina.io/projects/${clientId}/tokens`)}`,
  })
  return option['token'] as string
}

const choosePackageManager = async () => {
  const option = await prompts({
    name: 'selection',
    type: 'select',
    message: 'Choose your package manager',
    choices: [
      { title: 'PNPM', value: 'pnpm' },
      { title: 'Yarn', value: 'yarn' },
      { title: 'NPM', value: 'npm' },
    ],
  })
  return option['selection']
}

const chooseTypescript = async () => {
  const option = await prompts({
    name: 'selection',
    type: 'confirm',
    initial: true,
    message: 'Would you like to use Typescript?',
  })
  return option['selection']
}

const choosePublicFolder = async ({ framework }: { framework: Framework }) => {
  let suggestion = 'public'
  switch (framework.name) {
    case 'next':
      return 'public'
    case 'hugo':
      return 'static'
    case 'jekyll':
      suggestion = 'public'
      break
  }
  const option = await prompts({
    name: 'selection',
    type: 'text',
    message: `Where are public assets stored? (default: "${suggestion}")
Not sure what value to use? Refer to our "Frameworks" doc: https://tina.io/docs/integration/frameworks/`,
  })
  return option['selection'] || suggestion
}

const chooseFramework = async () => {
  const option = await prompts({
    name: 'selection',
    type: 'select',
    message: 'What framework are you using?',
    choices: [
      { title: 'Next.js', value: { name: 'next', reactive: true } },
      { title: 'Hugo', value: { name: 'hugo', reactive: false } },
      { title: 'Jekyll', value: { name: 'jekyll', reactive: false } },
      {
        title: 'Other (SSG frameworks like gatsby, etc.)',
        value: { name: 'other', reactive: false },
      },
    ] as { title: string; value: Framework }[],
  })
  return option['selection'] as Framework
}

const forestryMigrate = async ({
  forestryPath,
  rootPath,
}: {
  forestryPath: string
  rootPath: string
}): Promise<string> => {
  logger.info(
    `It looks like you have a ${focusText(
      '.forestry/settings.yml'
    )} file in your project.`
  )
  const option = await prompts({
    name: 'selection',
    type: 'confirm',
    initial: true,
    message: `Please note that this is a beta version and may contain some issues\nWould you like to migrate your Forestry templates?\n${logText(
      'Note: This migration will not be perfect, but it will get you started.'
    )}`,
  })
  if (!option['selection']) {
    return null
  }
  const collections = await generateCollections({
    forestryPath,
    rootPath,
  })
  return JSON.stringify(collections, null, 2)
}

const reportTelemetry = async ({
  hasForestryConfig,
  noTelemetry,
  usingTypescript,
}: {
  usingTypescript: boolean
  noTelemetry: boolean
  hasForestryConfig: boolean
}) => {
  if (noTelemetry) {
    logger.info(logText('Telemetry disabled'))
  }
  const telemetry = new Telemetry({ disabled: noTelemetry })
  const schemaFileType = usingTypescript ? 'ts' : 'js'
  await telemetry.submitRecord({
    event: {
      name: 'tinacms:cli:init:invoke',
      schemaFileType,
      hasForestryConfig,
    },
  })
}

const createPackageJSON = async () => {
  logger.info(logText('No package.json found, creating one'))
  await execShellCommand(`npm init --yes`)
}

const createOrAppendToGitignore = async (
  baseDir: string,
  gitignoredLines: string[]
) => {
  const hasGitignore = await fs.pathExistsSync(path.join(baseDir, '.gitignore'))
  if (hasGitignore) {
    const gitignoreContent = await fs
      .readFileSync(path.join(baseDir, '.gitignore'))
      .toString()
    const existingGitignoredLines = gitignoreContent.split('\n')
    const filteredGitignoredLines = gitignoredLines.filter(
      (line) => !existingGitignoredLines.includes(line)
    )
    const newGitignoreContent = [
      ...existingGitignoredLines,
      ...filteredGitignoredLines,
    ].join('\n')
    await fs.writeFileSync(
      path.join(baseDir, '.gitignore'),
      newGitignoreContent
    )
  } else {
    logger.info(logText('No .gitignore found, creating one'))
    await fs.outputFileSync(
      path.join(baseDir, '.gitignore'),
      gitignoredLines.join('\n')
    )
  }
}

const addDependencies = async (packageManager) => {
  logger.info(logText('Adding dependencies, this might take a moment...'))
  const deps = ['tinacms', '@tinacms/cli']
  const packageManagers = {
    pnpm: process.env.USE_WORKSPACE
      ? `pnpm add ${deps.join(' ')} --workspace`
      : `pnpm add ${deps.join(' ')}`,
    npm: `npm install ${deps.join(' ')}`,
    yarn: `yarn add ${deps.join(' ')}`,
  }
  logger.info(indentedCmd(`${logText(packageManagers[packageManager])}`))
  await execShellCommand(packageManagers[packageManager])
}

export interface AddConfigArgs {
  publicFolder: string
  baseDir: string
  tinaDirectory: string
  usingTypescript: boolean
  framework: Framework
  collections?: string
  token?: string
  clientId?: string
}
const addConfigFile = async (args: AddConfigArgs) => {
  const { baseDir, usingTypescript, tinaDirectory } = args
  const configPath = path.join(
    tinaDirectory,
    `config.${usingTypescript ? 'ts' : 'js'}`
  )
  const fullConfigPath = path.join(baseDir, configPath)
  if (fs.pathExistsSync(fullConfigPath)) {
    const override = await prompts({
      name: 'selection',
      type: 'confirm',
      message: `Found existing file at ${configPath}. Would you like to override?`,
    })
    if (override['selection']) {
      logger.info(logText(`Overriding file at ${configPath}.`))
      await fs.outputFileSync(fullConfigPath, config(args))
    } else {
      logger.info(logText(`Not overriding file at ${configPath}.`))
    }
  } else {
    logger.info(
      logText(
        `Adding config file at tina/config.${usingTypescript ? 'ts' : 'js'}`
      )
    )
    await fs.outputFileSync(fullConfigPath, config(args))
  }
}
const addReadMeFile = async (args: {
  baseDir: string
  tinaDirectory: string
}) => {
  const { baseDir, tinaDirectory } = args
  const fullConfigPath = path.join(baseDir, tinaDirectory, 'README.md')
  await fs.outputFileSync(fullConfigPath, readme)
}

const addContentFile = async ({ baseDir }: { baseDir: string }) => {
  const contentPath = path.join('content', 'posts', 'hello-world.md')
  const fullContentPath = path.join(baseDir, contentPath)
  if (fs.pathExistsSync(fullContentPath)) {
    const override = await prompts({
      name: 'selection',
      type: 'confirm',
      message: `Found existing file at ${contentPath}. Would you like to override?`,
    })
    if (override['selection']) {
      logger.info(logText(`Overriding file at ${contentPath}.`))
      await fs.outputFileSync(fullContentPath, content)
    } else {
      logger.info(logText(`Not overriding file at ${contentPath}.`))
    }
  } else {
    logger.info(logText(`Adding content file at ${contentPath}`))
    await fs.outputFileSync(fullContentPath, content)
  }
}

const logNextSteps = ({
  framework,
  packageManager,
}: {
  packageManager: string
  framework: Framework
}) => {
  logger.info(focusText(`\n${titleText(' TinaCMS ')} has been initialized!`))
  logger.info(
    'To get started run: ' +
      cmdText(frameworkDevCmds[framework.name]({ packageManager }))
  )
  logger.info(
    `\nOnce your site is running, access the CMS at ${linkText(
      '<YourDevURL>/admin/index.html'
    )}`
  )
}

const other = ({ packageManager }: { packageManager: string }) => {
  const packageManagers = {
    pnpm: `pnpm`,
    npm: `npx`, // npx is the way to run executables that aren't in your "scripts"
    yarn: `yarn`,
  }
  const installText = `${packageManagers[packageManager]} tinacms dev -c "<your dev command>"`
  return installText
}

const frameworkDevCmds: {
  [key in Framework['name']]: (args?: { packageManager: string }) => string
} = {
  other,
  hugo: other,
  jekyll: other,
  next: ({ packageManager }: { packageManager: string }) => {
    const packageManagers = {
      pnpm: `pnpm`,
      npm: `npm run`, // npx is the way to run executables that aren't in your "scripts"
      yarn: `yarn`,
    }
    const installText = `${packageManagers[packageManager]} dev`
    return installText
  },
}

const config = (args: AddConfigArgs) => {
  return format(configExamples[args.framework.name](args))
}

const content = `---
title: Hello, World!
---

Welcome to Tina, here is some dummy text:

I like it, but can the snow look a little warmer can you use a high definition screenshot,
so i'll know it when i see it, and that's great, but can you make it work for ie 2 please,
and just do what you think. I trust you theres all this spanish text on my site, yet can
you turn it around in photoshop so we can see more of the front. Labrador can you make the
logo bigger yes bigger bigger still the logo is too big, nor I like it, but can the snow
look a little warmer it needs to be the same, but totally different , yet I really like
the colour but can you change it, and this is just a 5 minutes job.

Can we have another option will royalties in the company do instead of cash can you remove
my double chin on my business card photo? i don't like the way it looks I need a website
How much will it cost. I love it, but can you invert all colors? make it pop, yet can you
pimp this powerpoint, need more geometry patterns, for try a more powerful colour, but I want
you to take it to the next level. There are more projects lined up charge extra the next time
we need to make the new version clean and sexy, yet can't you just take a picture from the internet?
that's going to be a chunk of change, nor that sandwich needs to be more playful. Low resolution?

> Lost and looking for a place to start? [Check out this guide](https://tina.io/guides/tina-cloud/getting-started/overview/)
> to see how to add TinaCMS to an existing Next.js site
`
const addReactiveFile = {
  next: ({
    baseDir,
    usingTypescript,
  }: {
    baseDir: string
    usingTypescript: boolean
  }) => {
    const usingSrc = !fs.pathExistsSync(path.join(baseDir, 'pages'))
    const pagesPath = path.join(baseDir, usingSrc ? 'src' : '', 'pages')
    const packageJSONPath = path.join(baseDir, 'package.json')

    const tinaBlogPagePath = path.join(pagesPath, 'demo', 'blog')
    const tinaBlogPagePathFile = path.join(
      tinaBlogPagePath,
      `[filename].${usingTypescript ? 'tsx' : 'js'}`
    )
    if (!fs.pathExistsSync(tinaBlogPagePathFile)) {
      fs.mkdirpSync(tinaBlogPagePath)
      fs.writeFileSync(tinaBlogPagePathFile, nextPostPage({ usingSrc }))
    }
    logger.info('Adding a nextjs example... ✅')

    // 4. update the users package.json
    const pack = JSON.parse(fs.readFileSync(packageJSONPath).toString())
    const oldScripts = pack.scripts || {}
    const newPack = JSON.stringify(
      {
        ...pack,
        scripts: extendNextScripts(oldScripts),
      },
      null,
      2
    )
    fs.writeFileSync(packageJSONPath, newPack)
  },
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
export function execShellCommand(cmd): Promise<string> {
  const exec = require('child_process').exec
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      }
      resolve(stdout ? stdout : stderr)
    })
  })
}
