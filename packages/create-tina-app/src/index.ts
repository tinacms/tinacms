import { Telemetry } from '@tinacms/metrics'
import { Command } from 'commander'
import prompts from 'prompts'
import path from 'node:path'
import { version, name } from '../package.json'
import { isWriteable, makeDir, isFolderEmpty } from './util/fileUtil'
import { install } from './util/install'
import chalk from 'chalk'
import { tryGitInit } from './util/git'
import { TEMPLATES, downloadTemplate } from './templates'
import { preRunChecks } from './util/preRunChecks'
import { checkPackageExists } from './util/checkPkgManagers'

export const PKG_MANAGERS = ['npm', 'yarn', 'pnpm']

const successText = chalk.bold.green
const linkText = chalk.bold.cyan
const cmdText = chalk.inverse
const logText = chalk.italic.gray

let projectName = ''

const program = new Command(name)
program
  .version(version)
  .option(
    '-t, --template <template>',
    `Choose which template to start from. Valid templates are: ${TEMPLATES.map(
      (x) => x.value
    )}`
  )
  .option(
    '-p, --pkg-manager <pkg-manager>',
    `Choose which package manager to use. Valid package managers are: ${PKG_MANAGERS}`
  )
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

  let template = opts.template
  if (template) {
    template = TEMPLATES.find((_template) => _template.value === template)
    if (!template) {
      console.error(
        `The provided template is invalid. Please provide one of the following: ${TEMPLATES.map(
          (x) => x.value
        )}`
      )
      throw new Error('Invalid template.')
    }
  }

  let pkgManager = opts.pkgManager
  if (pkgManager) {
    if (!PKG_MANAGERS.find((_pkgManager) => _pkgManager === pkgManager)) {
      console.error(
        `The provided package manager is not supported. Please provide one of the following: ${PKG_MANAGERS}`
      )
      throw new Error('Invalid package manager.')
    }
  }

  if (!pkgManager) {
    const installedPkgManagers = []
    for (const pkg_manager of PKG_MANAGERS) {
      try {
        await checkPackageExists(pkg_manager)
        installedPkgManagers.push(pkg_manager)
      } catch {}
    }

    if (installedPkgManagers.length === 0) {
      console.error(`You have no supported package managers installed. Please install one of the following: ${PKG_MANAGERS}`)
      throw new Error('No supported package managers installed.')
    }

    const pkgManagerRes = await prompts({
      message: 'Which package manager would you like to use?',
      name: 'packageManager',
      type: 'select',
      choices: installedPkgManagers.map((manager) => {
        return { title: manager, value: manager }
      }),
    })
    pkgManager = pkgManagerRes.packageManager
  }

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

  if (!template) {
    const templateRes = await prompts({
      name: 'template',
      type: 'select',
      message: 'What starter code would you like to use?',
      choices: TEMPLATES,
    })
    template = TEMPLATES.find((_template) => _template.value === templateRes.template)
  }

  //TODO: Update this?
  await telemetry.submitRecord({
    event: {
      name: 'create-tina-app:invoke',
      template: template,
      pkgManager: pkgManager,
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

  await downloadTemplate(template, root)

  console.log(
    logText('Installing packages. This might take a couple of minutes.\n')
  )

  // Run install command
  await install(root, null, { packageManager: pkgManager, isOnline: true })

  if (tryGitInit(root)) {
    console.log(logText('Initializing git repository.\n'))
  }

  console.log(`${successText('Starter successfully created!')}`)

  console.log(chalk.bold('\nTo launch your app, run:\n'))
  console.log(`\t${cmdText(`cd ${appName}`)}`)
  console.log(
    `  ${cmdText(`${pkgManager} ${pkgManager === 'npm' ? 'run ' : ''}dev`)}`
  )
  console.log('\nNext steps:\n')
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
