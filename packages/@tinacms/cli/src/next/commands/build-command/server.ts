import { build } from 'vite'
import { Database } from '@tinacms/graphql'
import { ConfigManager } from '../../config-manager'
import { pipeline } from 'readable-stream'
import { createServer } from 'net'
import { ManyLevelHost } from 'many-level'
import { MemoryLevel } from 'memory-level'
import { createConfig } from '../../vite'

export const createDBServer = () => {
  const levelHost = new ManyLevelHost(
    // @ts-ignore
    new MemoryLevel<string, Record<string, any>>({
      valueEncoding: 'json',
    })
  )
  const dbserver = createServer(function (socket) {
    // Pipe socket into host stream and vice versa
    return pipeline(socket, levelHost.createRpcStream(), socket, () => {
      // Disconnected
    })
  })
  dbserver.listen(9000)

  return dbserver
}

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
  const config = await createConfig(configManager, database, apiURL, [], noSDK)
  return build(config)
}
