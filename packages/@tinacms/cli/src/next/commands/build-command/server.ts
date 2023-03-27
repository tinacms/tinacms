import { build } from 'vite'
import { Database } from '@tinacms/graphql'
import { ConfigManager } from '../../config-manager'
import { createConfig } from '../../vite'
import { transformTsxPlugin } from '../../vite/plugins'

export const buildProductionSpa = async (
  configManager: ConfigManager,
  database: Database,
  apiURL: string,
  noSDK: boolean
) => {
  // TODO: make this configurable
  const publicEnv: Record<string, string> = {}
  Object.keys(process.env).forEach((key) => {
    if (
      key.startsWith('TINA_PUBLIC_') ||
      key.startsWith('NEXT_PUBLIC_') ||
      key === 'NODE_ENV' ||
      key === 'HEAD'
    ) {
      try {
        // if the value is a string, we can just use it
        if (typeof process.env[key] === 'string') {
          publicEnv[key] = process.env[key] as string
        } else {
          // otherwise, we need to stringify it
          publicEnv[key] = JSON.stringify(process.env[key])
        }
      } catch (error) {
        // if we can't stringify it, we'll just warn the user
        console.warn(
          `Could not stringify public env process.env.${key} env variable`
        )
        console.warn(error)
      }
    }
  })
  const config = await createConfig({
    plugins: [transformTsxPlugin({ configManager })],
    configManager,
    database,
    apiURL,
    noSDK,
    noWatch: true,
  })
  return build(config)
}
