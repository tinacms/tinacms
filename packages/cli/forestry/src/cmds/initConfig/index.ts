import chalk from 'chalk'
import * as fs from 'fs'
import { promptConfig, DEFAULT_CONFIG } from './promptConfig'
import { promptEngine } from './promptEngine'
const clear = require('clear')

export async function initConfig() {
  clear()
  console.log(
    'To build your site on the forestry servers we will need some configuration\n\n' +
      'This setup step will help you create a configuration file based on your static site generator\n\n' +
      'To create an advanced configuration, see our docs\n'
  )

  const engine = await promptEngine()

  logDefaults(engine)

  const config = await promptConfig(DEFAULT_CONFIG[engine])

  const configFileName = 'forestry-config.json'
  fs.writeFileSync(`./${configFileName}`, JSON.stringify(config, null, 2))

  console.log(
    `${chalk.green(
      '\nSuccess!'
    )} Your config has beeen created!\nYou can edit these values any time within ${chalk.bold(
      configFileName
    )}\n\n` +
      `If you are looking to deploy a dev server to forestry, you will first need to ${chalk.bold(
        'push this file to git.\n'
      )}`
  )
}

const logDefaults = (engine: string) => {
  console.log(`\nHere is the default config for ${chalk.green(engine)}\n`)
  const engineDefaults = DEFAULT_CONFIG[engine]

  const configKeys = [...Object.keys(engineDefaults as any)]
  configKeys.forEach(function(key: string) {
    console.log(`${chalk.bold(key)}: ${(engineDefaults as any)[key]}`)
  })
  console.log(``)
}
