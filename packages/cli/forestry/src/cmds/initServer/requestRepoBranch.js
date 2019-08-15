import simplegit from 'simple-git/promise'
import inquirer from 'inquirer'

export async function requestRepoBranch() {
  const git = simplegit()
  const branch = (await git.branchLocal()).current
  const repo = (await git.getRemotes(true))[0].refs.fetch

  await inquirer.prompt([
    {
      name: 'repositoryConfirmed',
      type: 'confirm',
      message: `Is this the repository you are looking to setup? \nRepository:${repo}\nBranch:${branch}`,
    },
  ])

  return {
    repo,
    branch,
  }
}
