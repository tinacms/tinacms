import { createServer as createViteServer } from 'vite'
import type { Plugin } from 'vite'
import { resolve as gqlResolve, Database } from '@tinacms/graphql'
import { ConfigManager } from '../../../config-manager'
import { createConfig } from '../../../vite'
import {
  devServerEndPointsPlugin,
  transformTsxPlugin,
} from '../../../vite/plugins'

export const createDevServer = async (
  configManager: ConfigManager,
  database: Database,
  apiURL: string,
  noSDK: boolean,
  noWatch: boolean
) => {
  const plugins: Plugin[] = [
    transformTsxPlugin({ configManager }),
    devServerEndPointsPlugin({ apiURL, configManager, database }),
  ]
  return createViteServer(
    await createConfig({
      configManager,
      database,
      apiURL,
      plugins,
      noSDK,
      noWatch,
      /**
       * Ensure Vite's import scan uses the spaMainPath as the input
       * so it properly finds everything. This is for dev only, and when
       * running the server outside of this monorepo vite fails to find
       * and optimize the imports, so you get errors about it not being
       * able to find an export from a module, and it's always a CJS
       * module that Vite would usually transform to an ES module.
       */
      rollupOptions: {
        input: configManager.spaMainPath,
      },
    })
  )
}
