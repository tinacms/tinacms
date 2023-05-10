import path from 'path'
import {
  BuildOptions,
  InlineConfig,
  Plugin,
  splitVendorChunkPlugin,
} from 'vite'
import react from '@vitejs/plugin-react'
import { Database } from '@tinacms/graphql'
import { tinaTailwind } from './tailwind'
import { ConfigManager } from '../config-manager'
import normalizePath from 'normalize-path'

export const createConfig = async ({
  configManager,
  database,
  apiURL,
  plugins = [],
  noWatch,
  rollupOptions,
}: {
  configManager: ConfigManager
  database: Database
  apiURL: string
  noWatch: boolean
  plugins?: Plugin[]
  rollupOptions?: BuildOptions['rollupOptions']
}) => {
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

  const alias = {
    TINA_IMPORT: configManager.tinaConfigFilePath,
    SCHEMA_IMPORT: configManager.generatedGraphQLJSONPath,
  }
  if (configManager.shouldSkipSDK()) {
    alias['CLIENT_IMPORT'] = path.join(
      configManager.spaRootPath,
      'src',
      'dummy-client.ts'
    )
  } else {
    alias['CLIENT_IMPORT'] = configManager.isUsingTs()
      ? configManager.generatedTypesTSFilePath
      : configManager.generatedTypesJSFilePath
  }

  let basePath
  if (configManager.config.build.basePath) {
    basePath = configManager.config.build.basePath
  }

  const config: InlineConfig = {
    root: configManager.spaRootPath,
    base: `/${basePath ? `${normalizePath(basePath)}/` : ''}${normalizePath(
      configManager.config.build.outputFolder
    )}/`,
    appType: 'spa',
    resolve: {
      alias,
      dedupe: ['graphql', 'tinacms', '@tinacms/toolkit', 'react', 'react-dom'],
    },
    define: {
      /**
       * Since we prebuild the config.ts, it's possible for modules to be loaded which make
       * use of `process`. The main scenario where this is an issue is when co-locating schema
       * definitions with source files, and specifically source files which impor from NextJS.
       *
       * Some examples of what NextJS uses for `process.env` are:
       *  - `process.env.__NEXT_TRAILING_SLASH`
       *  - `process.env.__NEXT_CROSS_ORIGIN`
       *  - `process.env.__NEXT_I18N_SUPPORT`
       *
       * Also, interestingly some of the advice for handling this doesn't work, references to replacing
       * `process.env` with `{}` are problematic, because browsers don't understand the `{}.` syntax,
       * but node does. This was a surprise, but using `new Object()` seems to do the trick.
       */
      'process.env': `new Object(${JSON.stringify(publicEnv)})`,
      // Used by picomatch https://github.com/micromatch/picomatch/blob/master/lib/utils.js#L4
      'process.platform': `"${process.platform}"`,
      __API_URL__: `"${apiURL}"`,
      __TOKEN__: `"${configManager.config.token}"`,
      __TINA_GRAPHQL_VERSION__: `"${configManager.getTinaGraphQLVersion()}"`,
    },
    optimizeDeps: {
      force: true,
      // Not 100% sure why this isn't being picked up automatically, this works from within the monorepo
      // but breaks externally
      include: ['react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    server: {
      host: configManager.config?.build?.host ?? false,
      watch: noWatch
        ? {
            ignored: ['**/*'],
          }
        : undefined,
      fs: {
        strict: false,
      },
    },
    build: {
      sourcemap: false,
      outDir: configManager.outputFolderPath,
      emptyOutDir: true,
      rollupOptions: rollupOptions,
    },
    plugins: [
      /**
       * `splitVendorChunkPlugin` is needed because `tinacms` and `@tinacms/toolkit` are quite large,
       * Vite's chunking strategy chokes on memory issues for smaller machines (ie. on CI).
       */
      react(),
      splitVendorChunkPlugin(),
      tinaTailwind(configManager.spaRootPath, configManager.tinaConfigFilePath),
      ...plugins,
    ],
  }

  return config
}
