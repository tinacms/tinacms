import clear from 'clear'
import figlet from 'figlet'
import chalk from 'chalk'
import { requestGitProvider } from './requestGitProvider'
import { retrieveAuthToken } from './retrieveAuthToken'
import { requestRepoBranch } from './requestRepoBranch'

export async function initServer() {
  clear()
  console.log(
    chalk.green(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
  )

  const repoBranch = await requestRepoBranch()
  const gitProvider = await requestGitProvider() //todo - we can probably pull this from the git remote
  const authToken = await retrieveAuthToken(gitProvider)

  console.log(
    'TODO - send this to our dev-server starter: ' +
      JSON.stringify({
        token: authToken,
        repo: repoBranch.repo,
        branch: repoBranch.branch,
        secrets: 'TODO',
      })
  )
}
