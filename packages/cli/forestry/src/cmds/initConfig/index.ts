import inquirer = require('inquirer')
import chalk from 'chalk'

const clear = require('clear')

const DEFAULT_CONFIG = {
  ['gatsby']: {
    install_dependencies_command: 'yarn install',
    build: 'npm run gatsby develop -p 8080 --host 0.0.0.0',
    output_directory: 'public',
    env: 'staging',
    build_image: 'node:10',
    mount_path: '/srv',
    working_dir: '/srv',
  },
}

export async function initConfig() {
  clear()
  console.log(
    'To build your site on the forestry servers we will need some configuration\n\n' +
      'This setup step will help you create a configuration file based on your static site generator\n\n' +
      'To create an advanced configuration, see our docs\n'
  )

  const engineOptions = await inquirer.prompt([
    {
      name: 'engine',
      type: 'list',
      message: 'Which engine do you use?',
      choices: ['gatsby', 'create-react-app', 'other'],
    },
  ])

  console.log(
    `\nHere is the default config for ${chalk.green(engineOptions.engine)}\n`
  )
  const defaultConfig = DEFAULT_CONFIG[engineOptions.engine as 'gatsby']
  const configValues = [...Object.keys(defaultConfig)].forEach(function(
    key: string
  ) {
    console.log(`${chalk.bold(key)}: ${(defaultConfig as any)[key]}`)
  })
  console.log(``)

  await inquirer.prompt([
    {
      name: 'confirmDefault',
      type: 'confirm',
      message: 'Do you want to use these defaults?',
    },
  ])
}
