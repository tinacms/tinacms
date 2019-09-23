import * as figlet from 'figlet'
import chalk from 'chalk'
import { requestGitProvider } from './requestGitProvider'
import { retrieveAuthToken } from './retrieveAuthToken'
import { requestRepo } from './requestRepoBranch'
import axios from 'axios'
import { getGitHttpUrl } from './gitUrl'
import { resolve } from 'url'
import listr = require('listr')
const clear = require('clear')

export async function create() {
  clear()
  console.log(
    chalk.green(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
  )
  console.log('\n')

  const repo = await requestRepo()
  const gitProvider = await requestGitProvider(repo)
  const authToken = await retrieveAuthToken(gitProvider)

  console.log('Creating app...')

  const result = await axios({
    method: 'POST',
    headers: { Authorization: 'Bearer ' + authToken },
    data: {
      provider: gitProvider,
      token: authToken,
      https_url: getGitHttpUrl(repo),
    },
    url: `${process.env.API_URL}/apps`,
  })

  console.log(
    `\n${chalk.bold('App Created! - ')} ${chalk.green(result.data.name)}`
  )
}
