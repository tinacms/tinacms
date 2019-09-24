import chalk from 'chalk'
import axios from 'axios'
import { readConfig } from '../../../config'
import { requestBranch, requestRepo } from '../requestRepoBranch'
import { getGitHttpUrl } from '../gitUrl'

const clear = require('clear')

export async function create() {
  const authToken = readConfig().auth.access_token
  const repo = await requestRepo()
  const branch = await requestBranch()

  const result = await axios({
    method: 'POST',
    headers: { Authorization: 'Bearer ' + authToken },
    data: {
      name: branch,
      secrets: {},
    },
    url: `${process.env.API_URL}/apps/${encodeURIComponent(
      getGitHttpUrl(repo)
    )}/environments`,
  })

  console.log(`\n${chalk.bold('Environment Created! - ')}`)
}
