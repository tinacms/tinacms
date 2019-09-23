import * as figlet from 'figlet'
import chalk from 'chalk'
import { requestGitProvider } from './requestGitProvider'
import { retrieveAuthToken } from './retrieveAuthToken'
import { requestRepo } from './requestRepoBranch'
import axios from 'axios'
import { getGitHttpUrl } from './gitUrl'
import { readConfig } from '../../config'
const clear = require('clear')

export async function create() {
  clear()
  console.log(
    chalk.green(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
  )
  console.log('\n')

  const repo = await requestRepo()
  const gitProvider = await requestGitProvider(repo)
  const gitProviderAuthToken = await retrieveAuthToken(gitProvider)

  console.log('Creating app...')

  const authToken = readConfig().auth.access_token
  const result = await axios({
    method: 'POST',
    headers: { Authorization: 'Bearer ' + authToken },
    data: {
      provider: gitProvider,
      token: gitProviderAuthToken,
      https_url: getGitHttpUrl(repo),
    },
    url: `${process.env.API_URL}/apps`,
  })

  console.log(
    `\n${chalk.bold('App Created! - ')} ${chalk.green(result.data.name)}`
  )
}
