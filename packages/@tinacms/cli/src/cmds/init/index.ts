import {
  AppJsContent,
  AppJsContentPrintout,
  adminPage,
  blogPost,
  nextPostPage,
} from './setup-files'
import { TinaProvider, TinaProviderDynamic } from './setup-files/tinaProvider'
import { logText, successText } from '../../utils/theme'
import { extendNextScripts } from '../../utils/script-helpers'
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
import fs, { outputFileSync, readFileSync, writeFileSync } from 'fs-extra'

import Progress from 'progress'
import { Telemetry } from '@tinacms/metrics'
import chalk from 'chalk'
import { logger } from '../../logger'
import p from 'path'
import prompts from 'prompts'

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd): Promise<string> {
  const exec = require('child_process').exec
  return new Promise((resolve, _reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
      }
      resolve(stdout ? stdout : stderr)
    })
  })
}

export async function initTina(ctx: any, next: () => void, options) {
  const telemetry = new Telemetry({ disabled: options.noTelemetry })
  await telemetry.submitRecord({
    event: {
      name: 'tinacms:cli:init:invoke',
      schemaFileType: options.schemaFileType || 'ts',
    },
  })
  logger.info(successText('Setting up Tina...'))
  next()
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const MIN_REACT_VERSION = '>=16.14.0'

export async function checkDeps(ctx: any, next: () => void, options) {
  const bar = new Progress('Checking dependencies. :prog', 1)

  if (!fs.existsSync(packageJSONPath)) {
    throw new Error(
      'No package.json Found. Please run tinacms init at the root of your app'
    )
  }
  const packageJSON = JSON.parse(
    (await fs.readFileSync(packageJSONPath)).toString()
  )
  if (
    !checkPackage(packageJSON, 'react') ||
    !checkPackage(packageJSON, 'react-dom')
  ) {
    const message = `Unable to initialize Tina due to outdated dependencies, try upgrading the following packages:
      "react@${MIN_REACT_VERSION}"
      "react-dom@${MIN_REACT_VERSION}"

  Then re-rerun "@tinacms/cli init"`
    throw new Error(message)
  }

  bar.tick({
    prog: '✅',
  })
  logger.level = 'fatal'
  next()
}

export const checkPackage = (packageJSON, packageName) => {
  let strippedVersion
  Object.entries(packageJSON.dependencies).map(
    ([depPackageName, version]: [string, string]) => {
      if (depPackageName === packageName) {
        strippedVersion = version.replace(/^[^a-zA-Z0-9]*|[^a-zA-Z0-9]*$/g, '')
      }
    }
  )
  if (!strippedVersion) {
    throw new Error(`Please add ${packageName} to your project`)
  }
  return checkVersion(strippedVersion)
}

/**
 * Checks for MIN_REACT_VERSION of 16.14.0
 */
const checkVersion = (version) => {
  const majorMin = 16
  const minorMin = 14
  const parts = version.split('.')
  const major = Number(parts[0])
  const minor = Number(parts[1])

  if (parts.length === 1) {
    if (isNaN(major)) {
      return true
    } else if (major > majorMin) {
      return true
    } else {
      return false
    }
  }

  if (major > majorMin) {
    return true
  } else if (major === majorMin) {
    if (minor >= minorMin) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

export async function installDeps(ctx: any, next: () => void, options) {
  const bar = new Progress(
    'Installing Tina packages. This might take a moment... :prog',
    2
  )
  const deps = ['tinacms', 'styled-components', '@tinacms/cli']

  bar.tick({
    prog: '',
  })
  const installCMD = `yarn add ${deps.join(' ')}`
  await execShellCommand(installCMD)

  // Fake installed used for dev
  // await delay(2000)
  bar.tick({
    prog: '✅',
  })
  logger.level = 'fatal'
  next()
}

const baseDir = process.cwd()
const packageJSONPath = p.join(baseDir, 'package.json')
const blogContentPath = p.join(baseDir, 'content', 'posts')
const blogPostPath = p.join(blogContentPath, 'HelloWorld.mdx')
const TinaFolder = p.join(baseDir, '.tina')
const componentFolder = p.join(TinaFolder, 'components')
const TinaProviderPath = p.join(componentFolder, 'TinaProvider.js')
const TinaDynamicProvider = p.join(componentFolder, 'TinaDynamicProvider.js')

export async function tinaSetup(_ctx: any, next: () => void, _options) {
  const usingSrc = !fs.pathExistsSync(p.join(baseDir, 'pages'))

  // 1. Create a content/blog Folder and add one or two blog posts
  if (!fs.pathExistsSync(blogPostPath)) {
    logger.info(logText('Adding a content folder...'))
    fs.mkdirpSync(blogContentPath)
    fs.writeFileSync(blogPostPath, blogPost)
  }

  // 2. Create a Tina Provider
  if (!fs.existsSync(TinaProviderPath) && !fs.existsSync(TinaDynamicProvider)) {
    fs.mkdirpSync(componentFolder)
    fs.writeFileSync(
      TinaProviderPath,
      TinaProvider.replace(
        /'\.\.\/schema\.ts'/,
        `'../schema.${_ctx.usingTs ? 'ts' : 'js'}'`
      )
    )
    fs.writeFileSync(TinaDynamicProvider, TinaProviderDynamic)
  }
  logger.level = 'info'

  // 3. Create an _app.js
  const pagesPath = p.join(baseDir, usingSrc ? 'src' : '', 'pages')
  const appPath = p.join(pagesPath, '_app.js')
  const appPathTS = p.join(pagesPath, '_app.tsx')
  const appExtension = fs.existsSync(appPath) ? '.js' : '.tsx'

  if (!fs.pathExistsSync(appPath) && !fs.pathExistsSync(appPathTS)) {
    // if they don't have a _app.js or an _app.tsx just make one
    logger.info(logText('Adding _app.js ... ✅'))
    fs.writeFileSync(appPath, AppJsContent(usingSrc))
  } else {
    const override = await prompts({
      name: 'res',
      type: 'confirm',
      message: `do you want us to ${chalk.bold(
        `override`
      )} your _app${appExtension}?`,
    })
    // Ask the user if they want to update there _app.js
    _ctx.overrideApp = override.res
    if (override.res) {
      logger.info(logText(`Adding _app${appExtension} ... ✅`))
      const appPathWithExtension = p.join(pagesPath, `_app${appExtension}`)
      const fileContent = fs.pathExistsSync(appPath)
        ? readFileSync(appPath)
        : readFileSync(appPathTS)
      const matches = [
        // @ts-ignore
        ...fileContent.toString().matchAll(/^.*import.*\.css("|').*$/gm),
      ]
      // This gets the primary match. see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match#using_match
      const primaryMatches = matches.map((x) => x[0])
      fs.writeFileSync(
        appPathWithExtension,
        AppJsContent(usingSrc, primaryMatches.join('\n'))
      )
    }
  }

  // 3. Create a /page/blog/[slug].tsx file with all of the Tina pieces wrapped up in one file

  const tinaBlogPagePath = p.join(pagesPath, 'demo', 'blog')
  const tinaBlogPagePathFile = p.join(tinaBlogPagePath, '[filename].js')
  if (!fs.pathExistsSync(tinaBlogPagePathFile)) {
    fs.mkdirpSync(tinaBlogPagePath)
    fs.writeFileSync(tinaBlogPagePathFile, nextPostPage({ usingSrc }))
  }
  logger.info('Adding a content folder... ✅')
  // 4. update the users package.json
  if (!fs.existsSync(packageJSONPath)) {
    throw new Error(
      'No package.json Found. Please run tinacms init at the root of your app'
    )
  } else {
    const pack = JSON.parse(readFileSync(packageJSONPath).toString())
    const oldScripts = pack.scripts || {}
    const newPack = JSON.stringify(
      {
        ...pack,
        scripts: extendNextScripts(oldScripts),
      },
      null,
      2
    )
    writeFileSync(packageJSONPath, newPack)
  }

  // pages/admin.tsx
  const adminPath = p.join(pagesPath, 'admin.js')
  if (fs.pathExistsSync(p.join(pagesPath, 'admin'))) {
    logger.warn(`Unable to add /pages/admin.js, this path already exists.
\tLearn more about toggling edit-mode at https://tina.io/docs/tinacms-context/#manually-toggling-edit-mode`)
    return next()
  }

  outputFileSync(adminPath, adminPage)

  next()
}

export async function successMessage(ctx: any, next: () => void, options) {
  const usingSrc = fs.pathExistsSync(p.join(baseDir, 'src'))

  logger.info(`Tina setup ${chalk.underline.green('done')} ✅\n`)

  logger.info('Next Steps: \n')

  if (!ctx.overrideApp) {
    logger.info(`${chalk.bold('Add the Tina wrapper')}`)
    logger.info(
      `⚠️ Before using Tina, you will NEED to add the Tina wrapper to your _app.jsx \n`
    )
    logger.info(`${AppJsContentPrintout(usingSrc)}`)
  }

  logger.info(`${chalk.bold('Run your site with Tina')}`)
  logger.info(`  yarn dev \n`)

  logger.info(`${chalk.bold('Start Editing')}`)
  logger.info(`  Go to 'http://localhost:3000/admin' \n`)

  logger.info(`${chalk.bold('Read the docs')}`)
  logger.info(
    `  Check out 'https://tina.io/docs/introduction/tina-init/#adding-tina' for help getting started with Tina \n`
  )

  logger.info(`Enjoy Tina! 🦙`)

  next()
}
