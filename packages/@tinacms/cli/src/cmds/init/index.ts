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
import { logText, successText } from '../../utils/theme'
import { logger } from '../../logger'
import fs from 'fs-extra'
import prompts from 'prompts'
import { Telemetry } from '@tinacms/metrics'
import { nextPostPage } from './setup-files'
import { extendNextScripts } from '../../utils/script-helpers'
import { configExamples } from './setup-files/config'

interface Framework {
  name: 'next' | 'other'
  reactive: boolean
}

export async function initStaticTina(ctx: any, next: () => void, options) {
  const baseDir = ctx.rootPath
  logger.level = 'info'
  // Choose package manager
  const packageManager = await choosePackageManager()

  // Choose framework
  const framework: Framework = await chooseFramework()

  // Choose typescript
  const usingTypescript = await chooseTypescript()

  // Choose public folder
  const publicFolder: string = await choosePublicFolder({ framework })

  // Report telemetry
  await reportTelemetry(usingTypescript, options.noTelemetry)

  // Check for package.json
  const hasPackageJSON = await fs.pathExistsSync('package.json')
  // if no package.json, init
  if (!hasPackageJSON) {
    await createPackageJSON()
  }

  // Check if .gitignore exists
  const hasGitignore = await fs.pathExistsSync('.gitignore')
  // if no .gitignore, create one
  if (!hasGitignore) {
    await createGitignore({ baseDir })
  } else {
    const hasNodeModulesIgnored = await checkGitignoreForNodeModules({
      baseDir,
    })
    if (!hasNodeModulesIgnored) {
      await addNodeModulesToGitignore({ baseDir })
    }
  }

  await addDependencies(packageManager)

  // add .tina/config.{js,ts}
  await addConfigFile({ publicFolder, baseDir, usingTypescript, framework })

  // add /content/posts/hello-world.md
  await addContentFile({ baseDir })

  if (framework.reactive) {
    await addReactiveFile[framework.name]({
      baseDir,
      framework,
      usingTypescript,
    })
  }

  logNextSteps({ packageManager, framework })
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
  if (framework.name === 'next') {
    return 'public'
  }
  const option = await prompts({
    name: 'selection',
    type: 'text',
    message: 'Where are public assets stored? (default: "public")',
  })
  return option['selection'] || 'public'
}

const chooseFramework = async () => {
  const option = await prompts({
    name: 'selection',
    type: 'select',
    message: 'What framework are you using?',
    choices: [
      { title: 'Next.js', value: { name: 'next', reactive: true } },
      {
        title: 'Other (SSG frameworks like hugo, jekyll, etc.)',
        value: { name: 'ssg', reactive: false },
      },
    ] as { title: string; value: Framework }[],
  })
  return option['selection'] as Framework
}

const reportTelemetry = async (
  usingTypescript: boolean,
  noTelemetry: boolean
) => {
  if (noTelemetry) {
    logger.info(logText('Telemetry disabled'))
  }
  const telemetry = new Telemetry({ disabled: noTelemetry })
  const schemaFileType = usingTypescript ? 'ts' : 'js'
  await telemetry.submitRecord({
    event: {
      name: 'tinacms:cli:init:invoke',
      schemaFileType,
    },
  })
}

const createPackageJSON = async () => {
  logger.info(logText('No package.json found, creating one'))
  await execShellCommand(`npm init --yes`)
}
const createGitignore = async ({ baseDir }: { baseDir: string }) => {
  logger.info(logText('No .gitignore found, creating one'))
  await fs.outputFileSync(path.join(baseDir, '.gitignore'), 'node_modules')
}

const checkGitignoreForNodeModules = async ({
  baseDir,
}: {
  baseDir: string
}) => {
  const gitignoreContent = await fs
    .readFileSync(path.join(baseDir, '.gitignore'))
    .toString()
  return gitignoreContent.split('\n').some((item) => item === 'node_modules')
}
const addNodeModulesToGitignore = async ({ baseDir }: { baseDir: string }) => {
  logger.info(logText('Adding node_modules to .gitignore'))
  const gitignoreContent = await fs
    .readFileSync(path.join(baseDir, '.gitignore'))
    .toString()
  const newGitignoreContent = [
    ...gitignoreContent.split('\n'),
    'node_modules',
  ].join('\n')
  await fs.writeFileSync(path.join(baseDir, '.gitignore'), newGitignoreContent)
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
  logger.info(`  ${logText(packageManagers[packageManager])}`)
  await execShellCommand(packageManagers[packageManager])
}

const addConfigFile = async ({
  framework,
  baseDir,
  publicFolder,
  usingTypescript,
}: {
  publicFolder: string
  baseDir: string
  usingTypescript: boolean
  framework: Framework
}) => {
  const configPath = path.join(
    '.tina',
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
      await fs.outputFileSync(
        fullConfigPath,
        config({ publicFolder, framework })
      )
    } else {
      logger.info(logText(`Not overriding file at ${configPath}.`))
    }
  } else {
    logger.info(
      logText(
        `Adding config file at .tina/config.${usingTypescript ? 'ts' : 'js'}`
      )
    )
    await fs.outputFileSync(fullConfigPath, config({ publicFolder, framework }))
  }
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
  logSteps[framework.name]({ packageManager })
}
const logSteps = {
  other: ({ packageManager }: { packageManager: string }) => {
    const packageManagers = {
      pnpm: `pnpm`,
      npm: `npx`, // npx is the way to run executables that aren't in your "scripts"
      yarn: `yarn`,
    }
    logger.info(`
  ${successText('TinaCMS has been initialized, to get started run:')}
  
      ${packageManagers[packageManager]} tinacms dev -c "<your dev command>"
  `)
  },
  next: ({ packageManager }: { packageManager: string }) => {
    const packageManagers = {
      pnpm: `pnpm`,
      npm: `npm run`, // npx is the way to run executables that aren't in your "scripts"
      yarn: `yarn`,
    }
    logger.info(`
  ${successText('TinaCMS has been initialized, to get started run:')}
  
      ${packageManagers[packageManager]} dev"
  `)
    logger.info(`
  ${successText('TinaCMS user interface is available at: /admin/index.html')}
  `)
  },
}

const config = (args: { publicFolder: string; framework: Framework }) => {
  return configExamples[args.framework.name](args)
}

const content = `---
title: Hello, World!
---

## Hello World!

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non lorem diam. Quisque vulputate nibh sodales eros pretium tincidunt. Aenean porttitor efficitur convallis. Nulla sagittis finibus convallis. Phasellus in fermentum quam, eu egestas tortor. Maecenas ac mollis leo. Integer maximus eu nisl vel sagittis.

Suspendisse facilisis, mi ac scelerisque interdum, ligula ex imperdiet felis, a posuere eros justo nec sem. Nullam laoreet accumsan metus, sit amet tincidunt orci egestas nec. Pellentesque ut aliquet ante, at tristique nunc. Donec non massa nibh. Ut posuere lacus non aliquam laoreet. Fusce pharetra ligula a felis porttitor, at mollis ipsum maximus. Donec quam tortor, vehicula a magna sit amet, tincidunt dictum enim. In hac habitasse platea dictumst. Mauris sit amet ornare ligula, blandit consequat risus. Duis malesuada pellentesque lectus, non feugiat turpis eleifend a. Nullam tempus ante et diam pretium, ac faucibus ligula interdum.
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
