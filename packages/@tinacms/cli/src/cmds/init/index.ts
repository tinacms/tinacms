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
import fs, { readFileSync, writeFileSync } from 'fs-extra'
import p from 'path'
import Progress from 'progress'
import prompts from 'prompts'

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

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd): Promise<string> {
  const exec = require('child_process').exec
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
      }
      resolve(stdout ? stdout : stderr)
    })
  })
}

export async function initTina(ctx: any, next: () => void, options) {
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
const TinaWrapperPathDir = p.join(baseDir, 'components')
const TinaWrapperPath = p.join(TinaWrapperPathDir, 'tina-wrapper.tsx')
const blogContentPath = p.join(baseDir, 'content', 'posts')
const blogPostPath = p.join(blogContentPath, 'HelloWorld.md')
export async function tinaSetup(ctx: any, next: () => void, options) {
  const useingSrc = fs.pathExistsSync(p.join(baseDir, 'src'))

  // 1. Create a content/blog Folder and add one or two blog posts
  if (!fs.pathExistsSync(blogPostPath)) {
    logger.info(logText('Adding a content folder...'))
    fs.mkdirpSync(blogContentPath)
    fs.writeFileSync(blogPostPath, blogPost)
  }

  // // 2. Create a Tina Wrapper
  // if (!fs.pathExistsSync(TinaWrapperPath)) {
  //   logger.info(logText('Adding a tina-wrapper...'))
  //   fs.mkdirpSync(TinaWrapperPathDir)
  //   fs.writeFileSync(TinaWrapperPath, TinaWrapper)
  // }
  logger.level = 'info'

  // 3. Create an _app.js
  const pagesPath = p.join(baseDir, useingSrc ? 'src' : '', 'pages')
  const appPath = p.join(pagesPath, '_app.js')
  const appPathTS = p.join(pagesPath, '_app.tsx')
  const appExtension = fs.existsSync(appPath) ? '.js' : '.tsx'
  let wrapper = false

  if (!fs.pathExistsSync(appPath) && !fs.pathExistsSync(appPathTS)) {
    // if they don't have a _app.js or an _app.tsx just make one
    logger.info(logText('Adding _app.js ... ✅'))
    fs.writeFileSync(appPath, AppJsContent)
  } else {
    // Ask the user if they want to update there _app.js
    const override = await prompts({
      name: 'res',
      type: 'confirm',
      message: `do you want us to override your _app${appExtension}?`,
    })
    if (override.res) {
      logger.info(logText(`Adding _app${appExtension} ... ✅`))
      const appPathWithExtension = p.join(pagesPath, `_app${appExtension}`)
      fs.writeFileSync(appPathWithExtension, AppJsContent)
    } else {
      wrapper = true
      logger.info(
        dangerText(
          `Heads up, to enable live-editing you'll need to wrap your page or site in Tina:\n`,
          warnText(AppJsContent)
        )
      )
    }
  }

  // 3. Create a /page/blog/[slug].tsx file with all of the Tina pieces wrapped up in one file

  const tinaBlogPagePath = p.join(pagesPath, 'demo', 'blog')
  const tinaBlogPagePathFile = p.join(tinaBlogPagePath, '[filename].tsx')
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

  // update the users /admin path
  const adminPath = p.join(pagesPath, 'admin.tsx')
  const adminPathJS = p.join(pagesPath, 'admin.js')
  if (!fs.existsSync(adminPath) && !fs.existsSync(adminPathJS)) {
    fs.writeFileSync(adminPathJS, adminPage)
  } else {
    const extension = fs.existsSync(adminPath) ? '.tsx' : 'js'
    const override = await prompts({
      name: 'override',
      type: 'confirm',
      message: `Whoops... looks like you already have an admin${extension} do you want to override it?`,
    })
    if (override.override) {
      fs.writeFileSync(p.join(pagesPath, 'admin' + extension), adminPage)
    } else {
      const res = await prompts({
        name: 'name',
        type: 'text',
        message: warnText(
          'What would you like the route to be named that enters edit mode?: '
        ),
      })
      const adminName = res.name || 'admin'
      fs.writeFileSync(p.join(pagesPath, adminName + extension), adminPage)
    }
  }
  next()
}

export async function successMessage(ctx: any, next: () => void, options) {
  const baseDir = process.cwd()
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
