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
import fs, { readFileSync, writeFileSync, outputFileSync } from 'fs-extra'
import p from 'path'
import Progress from 'progress'
import prompts from 'prompts'
import { Telemetry } from '@tinacms/metrics'

import {
  successText,
  logText,
  cmdText,
  warnText,
  dangerText,
} from '../../utils/theme'
import { blogPost, nextPostPage, AppJsContent, adminPage } from './setup-files'
import { logger } from '../../logger'
import chalk from 'chalk'
import { TinaProvider, TinaProviderIndex } from './setup-files/tinaProvider'

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
  await telemetry.submitRecord({ event: { name: 'tinacms:cli:init:invoke' } })
  logger.info(successText('Setting up Tina...'))
  next()
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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
// TODO: should handle src folder here
const blogContentPath = p.join(baseDir, 'content', 'posts')
const blogPostPath = p.join(blogContentPath, 'HelloWorld.md')
const TinaProviderFolder = p.join(baseDir, '.tina', 'components', 'provider')
const TinaProviderPath = p.join(TinaProviderFolder, '_TinaProvider.tsx')
const TinaProviderPathIndex = p.join(TinaProviderFolder, 'index.tsx')

export async function tinaSetup(ctx: any, next: () => void, options) {
  const useingSrc = fs.pathExistsSync(p.join(baseDir, 'src'))

  // 1. Create a content/blog Folder and add one or two blog posts
  if (!fs.pathExistsSync(blogPostPath)) {
    logger.info(logText('Adding a content folder...'))
    fs.mkdirpSync(blogContentPath)
    fs.writeFileSync(blogPostPath, blogPost)
  }

  // 2. Create a Tina Provider
  if (
    !fs.pathExistsSync(TinaProviderFolder) &&
    !fs.existsSync(TinaProviderPath) &&
    !fs.existsSync(TinaProviderPathIndex)
  ) {
    fs.mkdirpSync(TinaProviderFolder)
    fs.writeFileSync(TinaProviderPath, TinaProvider)
    fs.writeFileSync(TinaProviderPathIndex, TinaProviderIndex)
  }
  logger.level = 'info'

  // 3. Create an _app.js
  const pagesPath = p.join(baseDir, useingSrc ? 'src' : '', 'pages')
  const appPath = p.join(pagesPath, '_app.js')
  const appPathTS = p.join(pagesPath, '_app.tsx')
  const appExtension = fs.existsSync(appPath) ? '.js' : '.tsx'

  if (!fs.pathExistsSync(appPath) && !fs.pathExistsSync(appPathTS)) {
    // if they don't have a _app.js or an _app.tsx just make one
    logger.info(logText('Adding _app.js ... ✅'))
    fs.writeFileSync(appPath, AppJsContent(useingSrc))
  } else {
    // Ask the user if they want to update there _app.js
    const override = await prompts({
      name: 'res',
      type: 'confirm',
      message: `do you want us to ${chalk.bold(
        `override`
      )} your _app${appExtension}?`,
    })
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
        AppJsContent(useingSrc, primaryMatches.join('\n'))
      )
    } else {
      logger.info(
        dangerText(
          `Heads up, to enable live-editing you'll need to wrap your page or site in Tina:\n`,
          warnText(AppJsContent(useingSrc))
        )
      )
    }
  }

  // 3. Create a /page/blog/[slug].tsx file with all of the Tina pieces wrapped up in one file

  const tinaBlogPagePath = p.join(pagesPath, 'demo', 'blog')
  const tinaBlogPagePathFile = p.join(tinaBlogPagePath, '[filename].js')
  if (!fs.pathExistsSync(tinaBlogPagePathFile)) {
    fs.mkdirpSync(tinaBlogPagePath)
    fs.writeFileSync(tinaBlogPagePathFile, nextPostPage())
  }
  logger.info('Adding a content folder... ✅')
  // 4. update the users package.json
  const packagePath = p.join(baseDir, 'package.json')
  const pack = JSON.parse(readFileSync(packagePath).toString())
  const oldScripts = pack.scripts || {}
  const newPack = JSON.stringify(
    {
      ...pack,
      scripts: {
        ...oldScripts,
        'tina-dev': 'yarn tinacms server:start -c "next dev"',
        'tina-build': 'yarn tinacms server:start -c "next build"',
        'tina-start': 'yarn tinacms server:start -c "next start"',
      },
    },
    null,
    2
  )
  writeFileSync(packagePath, newPack)

  // pages/admin/[[...tina]].tsx
  const adminPath = p.join(pagesPath, 'admin', '[[...tina]].js')
  if (fs.pathExistsSync(p.join(pagesPath, 'admin'))) {
    logger.warn(`Unable to add /pages/admin/[[...tina]].js, this path already exists.
\tLearn more about toggling edit-mode at https://tina.io/docs/tinacms-context/#manually-toggling-edit-mode`)
    return next()
  }

  outputFileSync(adminPath, adminPage)

  next()
}

export async function successMessage(ctx: any, next: () => void, options) {
  logger.info(`Tina setup ${chalk.underline.green('done')}  ✅
\t Start your dev server with ${successText(
    `yarn tina-dev`
  )} and go to http://localhost:3000/demo/blog/HelloWorld to ${successText(
    'check it out the page that was created for you'
  )}
Enjoy Tina 🦙 !
`)
  next()
}

// These things can go on the page
// For more information visit our docs and check out our getting started guide

// Docs: https://tina.io/docs/tina-cloud/
// Getting starter guide: https://tina.io/guides/tina-cloud/starter/overview/

// \t3. Update the Schema.ts located ${p.join(
//   baseDir,
//   '.tina',
//   'schema.ts'
// )} to match your content: https://tina.io/docs/tina-cloud/cli/#defineschema
