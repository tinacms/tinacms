import inquirer = require('inquirer')
import { DEFAULT_CONFIG } from './promptConfig'

export const promptEngine = async () => {
  const engineOptions = await inquirer.prompt([
    {
      name: 'engine',
      type: 'list',
      message: 'Which engine do you use?',
      choices: Object.keys(DEFAULT_CONFIG),
    },
  ])
  return engineOptions.engine
}
