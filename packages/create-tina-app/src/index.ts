import { Telemetry } from '@tinacms/metrics'
import { Command } from 'commander'
import prompts from 'prompts'
import path from 'node:path'
import { version, name } from '../package.json'
import {
  isWriteable,
  setupProjectDirectory,
  updateProjectPackageName,
  updateProjectPackageVersion,
} from './util/fileUtil'
import { install } from './util/install'
import { initializeGit, makeFirstCommit } from './util/git'
import { TEMPLATES, downloadTemplate } from './templates'
import { preRunChecks } from './util/preRunChecks'
import { checkPackageExists } from './util/checkPkgManagers'
import { log, TextStyles } from './util/logger'
import { exit } from 'node:process'
import validate from 'validate-npm-package-name'

export const PKG_MANAGERS = ['npm', 'yarn', 'pnpm']

export async function run() {
  preRunChecks()

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
    .option(
      '-d, --dir <dir>',
      'Choose which directory to run this script from.'
    )
    .option('--noTelemetry', 'Disable anonymous telemetry that is collected.')
    .arguments('[project-directory]')
    .usage(`${TextStyles.success('<project-directory>')} [options]`)
    .action((name) => {
      projectName = name
    })

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
      log.err(
        `The provided template '${
          opts.template
        }' is invalid. Please provide one of the following: ${TEMPLATES.map(
          (x) => x.value
        )}`
      )
      exit(1)
    }
  }

  let pkgManager = opts.pkgManager
  if (pkgManager) {
    if (!PKG_MANAGERS.find((_pkgManager) => _pkgManager === pkgManager)) {
      log.err(
        `The provided package manager '${opts.pkgManager}' is not supported. Please provide one of the following: ${PKG_MANAGERS}`
      )
      exit(1)
    }
  }

  if (!pkgManager) {
    const installedPkgManagers = []
    for (const pkg_manager of PKG_MANAGERS) {
      if (await checkPackageExists(pkg_manager)) {
        installedPkgManagers.push(pkg_manager)
      }
    }

    if (installedPkgManagers.length === 0) {
      log.err(
        `You have no supported package managers installed. Please install one of the following: ${PKG_MANAGERS}`
      )
      exit(1)
    }

    const res = await prompts({
      message: 'Which package manager would you like to use?',
      name: 'packageManager',
      type: 'select',
      choices: installedPkgManagers.map((manager) => {
        return { title: manager, value: manager }
      }),
    })
    if (!Object.hasOwn(res, 'packageManager')) exit(1) // User most likely sent SIGINT.
    pkgManager = res.packageManager
  }

  if (!projectName) {
    const res = await prompts({
      name: 'name',
      type: 'text',
      message: 'What is your project named?',
      initial: 'my-tina-app',
      validate: (name) => {
        const { validForNewPackages, errors } = validate(
          path.basename(path.resolve(name))
        )
        if (validForNewPackages) return true
        return 'Invalid project name: ' + errors[0]
      },
    })
    if (!Object.hasOwn(res, 'name')) exit(1) // User most likely sent SIGINT.
    projectName = res.name
  }

  if (!template) {
    const res = await prompts({
      name: 'template',
      type: 'select',
      message: 'What starter code would you like to use?',
      choices: TEMPLATES,
    })
    if (!Object.hasOwn(res, 'template')) exit(1) // User most likely sent SIGINT.
    template = TEMPLATES.find((_template) => _template.value === res.template)
  }

  await telemetry.submitRecord({
    event: {
      name: 'create-tina-app:invoke',
      template: template,
      pkgManager: pkgManager,
    },
  })

  const rootDir = path.join(process.cwd(), projectName)
  if (!(await isWriteable(path.dirname(rootDir)))) {
    log.err(
      'The application path is not writable, please check folder permissions and try again. It is likely you do not have write permissions for this folder.'
    )
    process.exit(1)
  }
  const appName = await setupProjectDirectory(rootDir)

  try {
    await downloadTemplate(template, rootDir)
    updateProjectPackageName(rootDir, projectName)
    updateProjectPackageVersion(rootDir, '0.0.1')
  } catch (err) {
    log.err(`Failed to download template: ${(err as Error).message}`)
    exit(1)
  }

  log.info('Installing packages.')
  await install(rootDir, null, { packageManager: pkgManager, isOnline: true })

  log.info('Initializing git repository.')
  try {
    if (initializeGit()) {
      makeFirstCommit(rootDir)
      log.info('Initialized git repository.')
    }
  } catch (err) {
    log.err('Failed to initialize Git repository, skipping.')
  }

  log.success('Starter successfully created!')

  log.log(TextStyles.bold('\nTo launch your app, run:\n'))
  log.cmd(`cd ${appName}\n${pkgManager} run dev`)
  log.log(`\nNext steps:
    • 📝 Edit some content on ${TextStyles.link(
      'http://localhost:3000'
    )} (See ${TextStyles.link('https://tina.io/docs/using-tina-editor')})
    • 📖 Learn the basics: ${TextStyles.link('https://tina.io/docs/schema/')}
    • 🖌️ Extend Tina with custom field components: ${TextStyles.link(
      'https://tina.io/docs/advanced/extending-tina/'
    )}
    • 🚀 Deploy to Production: ${TextStyles.link(
      'https://tina.io/docs/tina-cloud/'
    )}
  `)
}

run()
