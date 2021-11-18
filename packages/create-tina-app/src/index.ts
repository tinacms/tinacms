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

import { Command } from 'commander'
import prompts from 'prompts'
// TODO: add and implement async-retry
// import retry from 'async-retry'
import path from 'path'
//@ts-ignore
import { version, name } from '../package.json'
import { getRepoInfo, downloadAndExtractRepo } from './util/examples'
import { isWriteable, makeDir, isFolderEmpty } from './util/fileUtil'
import { install } from './util/install'
import chalk from 'chalk'
import { tryGitInit } from './util/git'

const program = new Command(name)
let projectName = ''
program
  .version(version)
  .option('-e, --example <example>', 'Choose which example to start from')
  .option('-d, --dir <dir>', 'Choose which directory to run this script from')
  .arguments('[project-directory]')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action((name) => {
    projectName = name
  })

export const run = async () => {
  program.parse(process.argv)
  const opts = program.opts()
  if (opts.dir) {
    process.chdir(opts.dir)
  }
  const example = opts.example || 'basic'
  // const displayedCommand = useYarn ? 'yarn' : 'npm'
  const displayedCommand = 'yarn'
  const useYarn = true

  if (!projectName) {
    const res = await prompts({
      name: 'name',
      type: 'text',
      message: 'What is your project named?',
      initial: 'my-tina-app',
      // TODO: impalement validation logic
      // validate: (name) => {
      //   const validation = validateNpmName(path.basename(path.resolve(name)))
      //   if (validation.valid) {
      //     return true
      //   }
      //   return 'Invalid project name: ' + validation.problems![0]
      // },
    })
    projectName = res.name
  }
  const dirName = projectName

  const repoURL = new URL(
    `https://github.com/tinacms/tinacms/tree/examples/examples/${example}`
  )

  // Setup directory
  const root = path.join(process.cwd(), dirName)

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      'The application path is not writable, please check folder permissions and try again.'
    )
    console.error(
      'It is likely you do not have write permissions for this folder.'
    )
    process.exit(1)
  }

  const appName = path.basename(root)

  await makeDir(root)

  if (!isFolderEmpty(root, appName)) {
    process.exit(1)
  }

  const repoInfo = await getRepoInfo(repoURL)
  const repoInfo2 = repoInfo
  console.log(
    `Downloading files from repo ${chalk.cyan(
      example
    )}. This might take a moment.`
  )

  await downloadAndExtractRepo(root, repoInfo2)
  console.log('Installing packages. This might take a couple of minutes.')
  console.log()

  await install(root, null, { useYarn: true, isOnline: true })
  console.log()
  if (tryGitInit(root)) {
    console.log('Initialized a git repository.')
    console.log()
  }

  console.log({ repoInfo })
  console.log({ opts })

  console.log(`${chalk.green('Success!')} Created ${appName} at ${root}`)
  console.log('Inside that directory, you can run several commands:')
  console.log()
  console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}dev`))
  console.log('    Starts the development server.')
  console.log()
  console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`))
  console.log('    Builds the app for production.')
  console.log()
  console.log(chalk.cyan(`  ${displayedCommand} start`))
  console.log('    Runs the built app in production mode.')
  console.log()
  console.log('We suggest that you begin by typing:')
  console.log()
  console.log(chalk.cyan('  cd'), appName)
  console.log(
    `  ${chalk.cyan(`${displayedCommand} ${useYarn ? '' : 'run '}dev`)}`
  )
  console.log()
}

run()
