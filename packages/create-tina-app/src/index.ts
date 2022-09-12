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

import { Telemetry } from '@tinacms/metrics'
import { Command } from 'commander'
import prompts from 'prompts'
import path from 'path'
//@ts-ignore
import { version, name } from '../package.json'
import { isWriteable, makeDir, isFolderEmpty } from './util/fileUtil'
import { install } from './util/install'
import chalk from 'chalk'
import { tryGitInit } from './util/git'
import { exit } from 'process'
import { EXAMPLES, downloadExample } from './examples'
import { preRunChecks } from './util/preRunChecks'

const program = new Command(name)
let projectName = ''
program
  .version(version)
  .option('-e, --example <example>', 'Choose which example to start from')
  .option('-d, --dir <dir>', 'Choose which directory to run this script from')
  .option('--noTelemetry', 'Disable anonymous telemetry that is collected')
  .arguments('[project-directory]')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action((name) => {
    projectName = name
  })

export const run = async () => {
  preRunChecks()
  program.parse(process.argv)
  const opts = program.opts()
  if (opts.dir) {
    process.chdir(opts.dir)
  }
  const telemetry = new Telemetry({ disabled: opts?.noTelemetry })

  let example = opts.example

  const res = await prompts({
    message: 'Which package manager would you like to use?',
    name: 'useYarn',
    type: 'select',
    choices: [
      { title: 'Yarn', value: 'yarn' },
      { title: 'NPM', value: 'npm' },
    ],
  })

  const useYarn = res.useYarn === 'yarn'
  const displayedCommand = useYarn ? 'yarn' : 'npm'

  // If there is no project name passed in the CLI ask for one
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

  // If there is no --example passed thought the CLI
  if (!example) {
    const res = await prompts({
      name: 'example',
      type: 'select',
      message: 'What starter code would you like to use?',
      choices: EXAMPLES,
    })

    if (typeof res.example !== 'string') {
      console.error(chalk.red('Input must be a string'))
      exit(1)
    }
    example = res.example
  }
  const chosenExample = EXAMPLES.find((x) => x.value === example)

  if (!chosenExample) {
    console.error(
      `The example provided is not a valid example. Please provide one of the following; ${EXAMPLES.map(
        (x) => x.value
      )}`
    )
  }
  await telemetry.submitRecord({
    event: {
      name: 'create-tina-app:invoke',
      example,
      useYarn: Boolean(useYarn),
    },
  })

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
  process.chdir(root)

  if (!isFolderEmpty(root, appName)) {
    process.exit(1)
  }

  await downloadExample(chosenExample, root)

  console.log('Installing packages. This might take a couple of minutes.')
  console.log()

  // Run install command
  await install(root, null, { useYarn, isOnline: true })
  console.log(chalk.green('Finished installing all packages'))
  console.log()

  if (tryGitInit(root)) {
    console.log('Initialized a git repository.')
    console.log()
  }

  console.log(`${chalk.green('Success!')} Created ${appName} at ${root}`)

  // We can add this back in if we want
  // console.log('Inside that directory, you can run several commands:')
  // console.log()
  // console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}dev`))
  // console.log('    Starts the development server.')
  // console.log()
  // console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`))
  // console.log('    Builds the app for production.')
  // console.log()
  // console.log(chalk.cyan(`  ${displayedCommand} start`))
  // console.log('    Runs the built app in production mode.')
  // console.log()
  // console.log('We suggest that you begin by typing:')
  console.log(chalk.bold('\tTo launch your app, run:'))
  console.log()
  console.log(chalk.cyan('  cd'), appName)
  console.log(
    `  ${chalk.cyan(`${displayedCommand} ${useYarn ? '' : 'run '}dev`)}`
  )
  console.log()
  console.log(chalk.bold('  Next steps:'))
  console.log()
  console.log('- Go to http://localhost:3000/admin to enter edit-mode')
  console.log(
    '- Edit some content on http://localhost:3000 (See https://tina.io/docs/using-tina-editor )'
  )
  console.log(
    '- Check out our concept docs, to learn how Tina powers the starters under the hood. (See https://tina.io/docs/schema/)'
  )
  console.log(
    '- Learn how Tina can be extended to create new field components. (See https://tina.io/docs/advanced/extending-tina/) '
  )
  console.log(
    '- Make your site editable with Tina on production. (See https://tina.io/docs/tina-cloud/)'
  )
}

run()
