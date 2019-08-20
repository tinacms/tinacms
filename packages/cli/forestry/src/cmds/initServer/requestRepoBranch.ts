import * as simplegit from 'simple-git/promise'
import * as inquirer from 'inquirer'

export async function requestRepoBranch() {
  const git = simplegit()
  const branch = (await git.branchLocal()).current

  const remotes = await git.getRemotes(true)
  const repo = (remotes || []).find(remote => remote.name == 'origin')
  if (!repo) {
    console.error('There are no git remotes setup within this directory')
    process.exit(1)
  }
  const repoUrl = repo!.refs.fetch
  console.log(repoUrl)

  // const remoteConfirmation = await inquirer.prompt([
  //   {
  //     name: 'remote',
  //     type: 'list',
  //     message: `Choose the remote you're looking to setup`,
  //     choices: remotes.map((r: { refs: any }) => `${r.refs.fetch} (${branch})`),
  //   },
  // ])

  return {
    repo: repoUrl,
    branch,
  }
}
