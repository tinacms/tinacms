import inquirer = require('inquirer')

interface Config {
  install_dependencies_command: string
  build_command: string
  output_directory: string
  env: string
  build_image: string
  mount_path: string
  working_dir: string
}

interface EngineDefaults {
  [key: string]: Config
}

export const DEFAULT_CONFIG: EngineDefaults = {
  ['gatsby']: {
    install_dependencies_command: 'yarn install',
    build_command: 'npm run gatsby develop -p 8080 --host 0.0.0.0',
    output_directory: 'public',
    env: 'staging',
    build_image: 'node:10',
    mount_path: '/srv',
    working_dir: '/srv',
  },
}

export const promptConfig = async (defaults: Config) => {
  const useDefaultsConfirmation = await inquirer.prompt([
    {
      name: 'confirmDefault',
      type: 'confirm',
      message: 'Do you want to use these defaults?',
    },
  ])
  if (useDefaultsConfirmation.confirmDefault) {
    return defaults
  } else {
    const configKeys = [...Object.keys(defaults)]
    var questions = configKeys.map(key => {
      return {
        message: `${key}`,
        type: 'input',
        name: key,
        default: (defaults as any)[key],
      }
    })
    const result = await inquirer.prompt(questions)

    return result
  }
}
