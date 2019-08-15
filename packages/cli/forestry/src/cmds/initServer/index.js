import clear from 'clear'
import figlet from 'figlet'
import inquirer from 'inquirer'
import chalk from 'chalk'
import simplegit from 'simple-git/promise'
import { requestGitProvider } from './requestGitProvider'
import { retrieveAuthToken } from './retrieveAuthToken'

export async function initServer() {
  clear()
  console.log(
    chalk.green(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
  )

  const gitProvider = await requestGitProvider()
  const authToken = await retrieveAuthToken(gitProvider)

  const git = simplegit()
  const branch = (await git.branchLocal()).current
  const remote = (await git.getRemotes(true))[0].refs.fetch

  await inquirer.prompt([
    {
      name: 'repositoryConfirmed',
      type: 'confirm',
      message: `Is this the repository you are looking to setup? \nRepository:${remote}\nBranch:${branch}`,
    },
  ])

  console.log(
    'TODO - send this to our dev-server starter: ' +
      JSON.stringify({
        token: authToken,
        repo: remote,
        branch,
        secrets: 'TODO',
      })
  )
}
