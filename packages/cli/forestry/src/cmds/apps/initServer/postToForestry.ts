import chalk from 'chalk'
import axios from 'axios'
import * as listr from 'listr'
import { readConfig } from '../../../config'

export const postToForestry = async (
  provider: string,
  gitProviderToken: string,
  repo: string,
  branch: string
) => {
  console.log(
    `\nyour site will available at: ${chalk.green('dev.hamburger.com')}`
  )

  const authToken = readConfig().auth.access_token

  const tasks = new listr([
    {
      title: 'Posting to Forestry',
      task: () =>
        axios({
          method: 'POST',
          headers: { Authorization: 'Bearer ' + authToken },
          data: {
            provider: provider,
            token: gitProviderToken,
            repo,
            branch: branch,
          },
          url: `${process.env.API_URL}/app/create`,
        }),
    },
    {
      title: 'Cloning remote repo (stub)',
      task: () => wait2(''),
    },
    {
      title: 'Starting Dev Server (stub)',
      task: () => wait2(''),
    },
  ])

  await tasks.run().catch(err => {
    process.exit(1)
  })
  console.log(
    `\nyour dev server is live at: ${chalk.green('dev.hamburger.com')}`
  )
}

const wait2 = async (result: string) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 2000)
  })
}
