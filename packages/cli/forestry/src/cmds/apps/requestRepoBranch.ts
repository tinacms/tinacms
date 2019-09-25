import * as simplegit from 'simple-git/promise'
import * as inquirer from 'inquirer'
import chalk from 'chalk'

export const requestRepo = async (): Promise<string> => {
  const git = simplegit()

  const remotes = await git.getRemotes(true)
  const repo = (remotes || []).find(remote => remote.name == 'origin')
  if (!repo) {
    console.error('There are no git remotes setup within this directory')
    process.exit(1)
  }

  const repoUrl = repo!.refs.fetch
  console.log(`${chalk.bold('Repo:')} ${repoUrl} (origin)`)
  console.log('\n')
  return repoUrl
}

export async function requestBranch() {
  const git = simplegit()

  const branches = await git.branch([])
  const branchConfirmation = await inquirer.prompt([
    {
      name: 'branch',
      type: 'list',
      message: `Choose the branch you're looking to setup`,
      choices: branches.all,
      default: branches.current,
    },
  ])

  return branchConfirmation.branch
}
