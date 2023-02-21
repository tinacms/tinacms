/**

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

const successText = chalk.bold.green
const linkText = chalk.bold.cyan
const cmdText = chalk.inverse

const logText = chalk.italic.gray

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

  console.log(
    logText('Installing packages. This might take a couple of minutes.')
  )
  console.log()

  // Run install command
  await install(root, null, { useYarn, isOnline: true })

  if (tryGitInit(root)) {
    console.log(logText('Initializing git repository.'))
    console.log()
  }

  console.log(`${successText('Starter successfully created!')}`)

  console.log(chalk.bold('\nTo launch your app, run:\n'))
  console.log('  ' + cmdText(`cd ${appName}`))
  console.log(
    '  ' + `${cmdText(`${displayedCommand} ${useYarn ? '' : 'run '}dev`)}`
  )
  console.log()
  console.log('Next steps:')
  console.log()
  console.log(
    `• 📝 Edit some content on ${linkText(
      'http://localhost:3000'
    )} (See ${linkText('https://tina.io/docs/using-tina-editor')})`
  )
  console.log(
    `• 📖 Learn the basics: ${linkText('https://tina.io/docs/schema/')}`
  )
  console.log(
    `• 🖌️ Extend Tina with custom field components: ${linkText(
      'https://tina.io/docs/advanced/extending-tina/'
    )}`
  )
  console.log(
    `• 🚀 Deploy to Production: ${linkText('https://tina.io/docs/tina-cloud/')}`
  )
}

run()
