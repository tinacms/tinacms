import chalk from 'chalk'
import listr from 'listr'

export const postToForestry = async (authToken, repo, branch) => {
  const devServer = 'https://hamburger.forestry.dev'
  console.log(`\nyour site will available at: ${chalk.green(devServer)}`)
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

const wait2 = async result => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 2000)
  })
}
