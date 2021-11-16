import { Command } from 'commander'
// import retry from 'async-retry'
import p from 'path'
import { version, name } from '../package.json'
import { getRepoInfo, downloadAndExtractRepo } from './util/examples'

const repoURL = new URL(
  'https://github.com/tinacms/tinacms/tree/examples/examples/basic'
)
const program = new Command(name)
program.version(version)

program.option('-e, --example <example>', 'Choose which example to start from')

export const run = async () => {
  program.parse(process.argv)

  const opts = program.opts()
  const repoInfo = await getRepoInfo(repoURL)
  const repoInfo2 = repoInfo
  //   console.log(
  //     `Downloading files from repo ${chalk.cyan(
  //       example
  //     )}. This might take a moment.`
  //   )
  console.log()
  const root = p.join(process.cwd(), 'test')
  await downloadAndExtractRepo(root, repoInfo2)

  console.log({ repoInfo })
  console.log({ opts })
}

run()
