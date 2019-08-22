import chalk from 'chalk'
import axios from 'axios'
import * as listr from 'listr'
import { readConfig } from '../../config'

export const postToForestry = async (
  authToken: string,
  repo: string,
  branch: string
) => {
  const devServer = 'http://localhost:3000/app/create'

  console.log(`\nyour site will available at: ${chalk.green(devServer)}`)

  const token = readConfig().auth.access_token
  const body = await axios({
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    data: {
      provider: '123',
      token: '321',
      repo: 'repo',
      branch: '12',
    },
    url: devServer,
  })

  console.log(body)

  const tasks = new listr([
    {
      title: 'Posting to Forestry',
      task: () => wait2(''),
    },
    {
      title: 'Cloning remote repo',
      task: () => wait2(''),
    },
    {
      title: 'Starting Dev Server',
      task: () => wait2(''),
    },
  ])

  await tasks.run().catch(err => {
    console.error(err)
  })
  console.log(`\nyour dev server is live at: ${chalk.green(devServer)}`)
}

const wait2 = async (result: string) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 2000)
  })
}
