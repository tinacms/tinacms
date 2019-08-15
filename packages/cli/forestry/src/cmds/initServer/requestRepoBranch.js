import simplegit from 'simple-git/promise'
import inquirer from 'inquirer'

export async function requestRepoBranch() {
  const git = simplegit()
  const branch = (await git.branchLocal()).current

  const remotes = await git.getRemotes(true)
  if (!remotes) {
    console.error('There are no git remotes setup within this directory')
    process.exit(1)
  }

  const remoteConfirmation = await inquirer.prompt([
    {
      name: 'remote',
      type: 'list',
      message: `Choose the remote you're looking to setup`,
      choices: remotes.map(r => `${r.refs.fetch} (${branch})`),
    },
  ])

  return {
    repo: remoteConfirmation.remote,
    branch,
  }
}
