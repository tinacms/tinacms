import { Command } from 'commander'
// import retry from 'async-retry'
import path from 'path'
import { version, name } from '../package.json'
import { getRepoInfo, downloadAndExtractRepo } from './util/examples'
import { isWriteable, makeDir, isFolderEmpty } from './util/fileUtil'
import { install } from './util/install'
import chalk from 'chalk'

const program = new Command(name)
program.version(version)

program.option('-e, --example <example>', 'Choose which example to start from')

export const run = async () => {
  program.parse(process.argv)
  const opts = program.opts()
  const example = opts.example || 'basic'
  const dirName = 'test'

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

  await install(root, null, { useYarn: false, isOnline: true })
  console.log()

  console.log({ repoInfo })
  console.log({ opts })
}

run()
