import * as figlet from 'figlet'
import chalk from 'chalk'
import { requestGitProvider } from '../requestGitProvider'
import { retrieveAuthToken } from '../retrieveAuthToken'
import { requestRepo } from '../requestRepoBranch'
import { postToForestry } from './postToForestry'
import { getGitHttpUrl } from '../gitUrl'
const clear = require('clear')

export async function initServer() {
  clear()
  console.log(
    chalk.green(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
  )
  console.log('\n')

  const repo = await requestRepo()
  const gitProvider = await requestGitProvider(repo)
  const authToken = await retrieveAuthToken(gitProvider)

  await postToForestry(gitProvider, authToken, getGitHttpUrl(repo))
}
