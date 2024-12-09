import { createServer as createViteServer } from 'vite'
import type { Plugin } from 'vite'
import type { Database } from '@tinacms/graphql'
import { ConfigManager } from '../../../config-manager'
import { createConfig } from '../../../vite'
import {
  devServerEndPointsPlugin,
  transformTsxPlugin,
  viteTransformExtension,
} from '../../../vite/plugins'

export const createDevServer = async (
  configManager: ConfigManager,
  database: Database,
  searchIndex: any,
  apiURL: string,
  noWatch: boolean
) => {
  const plugins: Plugin[] = [
    transformTsxPlugin({ configManager }),
    devServerEndPointsPlugin({ apiURL, configManager, database, searchIndex }),
    viteTransformExtension(),
  ]
  return createViteServer(
    await createConfig({
      configManager,
      database,
      apiURL,
      plugins,
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
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
          }
          warn(warning)
        },
      },
      viteConfigEnv: {
        command: 'serve',
        mode: 'development',
      },
    })
  )
}
