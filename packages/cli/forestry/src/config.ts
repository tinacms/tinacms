import * as path from 'path'

import * as os from 'os'
import * as fs from 'fs'

const configPath = path.join(os.homedir(), '.forestry-config')

export const readConfig = () => {
  try {
    let rawConfig = fs.readFileSync(configPath)
    return JSON.parse(rawConfig as any)
  } catch (e) {
    return {}
  }
}

export const writeConfig = (newConfig: any) => {
  fs.writeFileSync(configPath, JSON.stringify(newConfig))
}

export const isAuthenticated = () => {
  const config = readConfig()
  return !!config.token
}
