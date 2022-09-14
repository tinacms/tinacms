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
import { execShellCommand } from '.'
import { Telemetry } from '@tinacms/metrics'

export async function initStaticTina(ctx: any, next: () => void, options) {
  logger.level = 'info'
  // Choose package manager
  const packageManager = await choosePackageManager()

  // Choose typescript
  const usingTypescript = await chooseTypescript()

  // Choose public folder
  const publicFolder = await choosePublicFolder()

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
    await createGitignore()
  } else {
    const hasNodeModulesIgnored = await checkGitignoreForNodeModules()
    if (!hasNodeModulesIgnored) {
      await addNodeModulesToGitignore()
    }
  }

  await addDependencies(packageManager)

  await addConfigFile(publicFolder, usingTypescript)

  await addContentFile()

  logNextSteps(packageManager)
}
const baseDir = process.cwd()

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

const choosePublicFolder = async () => {
  const option = await prompts({
    name: 'selection',
    type: 'text',
    message: 'Where are public assets stored? (default: "public")',
  })
  return option['selection'] || 'public'
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
  execShellCommand(`npm init --yes`)
}
const createGitignore = async () => {
  logger.info(logText('No .gitignore found, creating one'))
  await fs.outputFileSync(path.join(baseDir, '.gitignore'), 'node_modules')
}

const checkGitignoreForNodeModules = async () => {
  const gitignoreContent = await fs
    .readFileSync(path.join(baseDir, '.gitignore'))
    .toString()
  return gitignoreContent.split('\n').some((item) => item === 'node_modules')
}
const addNodeModulesToGitignore = async () => {
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
    pnpm: `pnpm add ${deps.join(' ')}${
      process.env.USE_WORKSPACE ? ' --workspace' : ''
    }`,
    npm: `npm install ${deps.join(' ')}`,
    yarn: `yarn add ${deps.join(' ')}`,
  }
  logger.info(logText(packageManagers[packageManager]))
  await execShellCommand(packageManagers[packageManager])
}

const addConfigFile = async (
  publicFolder: string,
  usingTypescript: boolean
) => {
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
      await fs.outputFileSync(fullConfigPath, config({ publicFolder }))
    } else {
      logger.info(logText(`Not overriding file at ${configPath}.`))
    }
  } else {
    logger.info(
      logText(
        `Adding config file at .tina/config.${usingTypescript ? 'ts' : 'js'}`
      )
    )
    await fs.outputFileSync(fullConfigPath, config({ publicFolder }))
  }
}

const addContentFile = async () => {
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

const logNextSteps = (packageManager: string) => {
  logger.info(`
${successText('TinaCMS has been initialized, to get started run:')}

    ${packageManager} tinacms dev -c "<your dev command>"
`)
}

const config = (args: { publicFolder: string }) => `
import { defineStaticConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineStaticConfig({
  branch,
  clientId: null,   // Get this from tina.io
  token: null,      // Get this from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "${args.publicFolder}",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "${args.publicFolder}",
    },
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
`

const content = `---
title: Hello, World!
---

## Hello World!

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non lorem diam. Quisque vulputate nibh sodales eros pretium tincidunt. Aenean porttitor efficitur convallis. Nulla sagittis finibus convallis. Phasellus in fermentum quam, eu egestas tortor. Maecenas ac mollis leo. Integer maximus eu nisl vel sagittis.

Suspendisse facilisis, mi ac scelerisque interdum, ligula ex imperdiet felis, a posuere eros justo nec sem. Nullam laoreet accumsan metus, sit amet tincidunt orci egestas nec. Pellentesque ut aliquet ante, at tristique nunc. Donec non massa nibh. Ut posuere lacus non aliquam laoreet. Fusce pharetra ligula a felis porttitor, at mollis ipsum maximus. Donec quam tortor, vehicula a magna sit amet, tincidunt dictum enim. In hac habitasse platea dictumst. Mauris sit amet ornare ligula, blandit consequat risus. Duis malesuada pellentesque lectus, non feugiat turpis eleifend a. Nullam tempus ante et diam pretium, ac faucibus ligula interdum.
`
