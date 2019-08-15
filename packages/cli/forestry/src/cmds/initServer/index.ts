import * as figlet from 'figlet'
import chalk from 'chalk'
import { requestGitProvider } from './requestGitProvider'
import { retrieveAuthToken } from './retrieveAuthToken'
import { requestRepoBranch } from './requestRepoBranch'
import { postToForestry } from './postToForestry'
//@ts-ignore
import clear from 'clear'

export async function initServer() {
  clear()
  console.log(
    chalk.green(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
  )
  console.log('\n')

  const repoBranch = await requestRepoBranch()
  const gitProvider = await requestGitProvider(repoBranch.repo)
  const authToken = await retrieveAuthToken(gitProvider)

  await postToForestry(authToken, repoBranch.repo, repoBranch.branch)
}
