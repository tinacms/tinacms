/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import fs from 'fs-extra'
import path from 'path'
import { build, createServer, splitVendorChunkPlugin } from 'vite'
import type { InlineConfig, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { viteTina } from './tailwind'
import { devHTML, prodHTML } from './html'

let server: ViteDevServer
let hasCopiedFiles = false

export const viteBuild = async ({
  rootPath,
  outputFolder,
  publicFolder,
  local: l,
  apiUrl,
}: {
  local: boolean
  rootPath: string
  publicFolder: string
  outputFolder: string
  apiUrl: string
}) => {
  const local = l
  const localBuild = l
  const node_env = JSON.stringify(process.env.NODE_ENV)
  const generatedPath = path.join(rootPath, '.tina', '__generated__')
  /**
   * The final location of the SPA assets
   * @example public/admin
   */
  const outputPath = path.join(rootPath, publicFolder, outputFolder)
  /**
   * The location to copy source files FROM
   * @example node_modules/@tinacms/app/appFiles
   */
  const appCopyPath = path.join(__dirname, '..', 'appFiles')
  /**
   * The location to copy source files
   * @example .tina/__generated__/app
   */
  // const appRootPath = path.join(__dirname, '..', 'appFiles')
  const appRootPath = path.join(generatedPath, 'app')
  /**
   * The location to write the dev HTML file to.
   * This file retrieves assets via HTTP request to the Vite dev server
   */
  const devHTMLPath = path.join(outputPath, 'index.html')
  /**
   * The location to write the production HTML file to.
   * In contrast to the dev HTML file, the production file needs
   * to be adjacent to the source files that are copied over
   */
  const prodHTMLPath = path.join(appRootPath, 'index.html')
  /**
   * The location of the user-defined config
   */
  const configPath = path.join(rootPath, '.tina', 'config')
  /**
   * The location where the user-defined config is "prebuilt" to.
   */
  const configPrebuildPath = path.join(generatedPath, 'prebuild', 'config.js')
  /**
   * The prebuild step takes the user-defined config and bundles it, leaving out
   * dependencies we bring with us (react, react-dom, tinacms) of the bundle.
   *
   * It then treats the output as the source of truth for user-defined config
   */
  const prebuildConfig: InlineConfig = {
    // This doesn't do anything in this case, but without it, Vite seems
    // to assume the cwd, and copies values from `/public` automatically
    // it seems like it just needs to be any folder that does not have a 'public' folder
    root: path.join(generatedPath, 'prebuild'),
    // NextJS forces es5 on tsconfig, specifying it here ignores that
    // https://github.com/evanw/esbuild/issues/1355
    esbuild: {
      target: 'es2020',
    },
    mode: local ? 'development' : 'production',
    build: {
      outDir: path.join(generatedPath, 'prebuild'),
      lib: {
        entry: configPath,
        fileName: () => {
          return 'config.js'
        },
        formats: ['es'],
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'tinacms', 'next'],
      },
    },
    logLevel: 'silent',
  }
  if (!hasCopiedFiles) {
    // Remove old files
    fs.remove(path.join(generatedPath, 'prebuild'))
    fs.remove(path.join(generatedPath, 'app'))
  }
  await build(prebuildConfig)

  const alias = {
    TINA_IMPORT: configPrebuildPath,
  }

  const config: InlineConfig = {
    root: appRootPath,
    base: `/${outputFolder}/`,
    mode: local ? 'development' : 'production',
    /**
     * `splitVendorChunkPlugin` is needed because `tinacms` and `@tinacms/toolkit` are quite large,
     * Vite's chunking strategy chokes on memory issues for smaller machines (ie. on CI).
     */
    plugins: [splitVendorChunkPlugin(), react(), viteTina()],
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
      'process.env': 'new Object()',
      __API_URL__: `"${apiUrl}"`,
    },
    // NextJS forces es5 on tsconfig, specifying it here ignores that
    // https://github.com/evanw/esbuild/issues/1355
    esbuild: {
      target: 'es2020',
    },
    server: {
      port: 5173,
      fs: {
        strict: false,
      },
    },
    resolve: {
      alias,
      dedupe: ['graphql'],
    },
    build: {
      sourcemap: true,
      outDir: outputPath,
      emptyOutDir: false,
    },
    logLevel: 'silent',
  }
  if (!hasCopiedFiles) {
    if (process.env.MONOREPO_DEV) {
      console.warn('Using monorepo dev mode, source files will be symlinked')
      await fs.createSymlink(appCopyPath, appRootPath, 'dir')
    } else {
      await fs.copy(appCopyPath, appRootPath)
    }

    // await execShellCommand(
    //   `npm --prefix ${appRootPath} i --legacy-peer-deps --omit=dev --no-package-lock`
    // )
    await fs.outputFile(
      path.join(outputPath, '.gitignore'),
      `index.html
assets/`
    )
  }
  if (localBuild) {
    if (!hasCopiedFiles) {
      const replaceAll = (string: string, target: string, value: string) => {
        const regex = new RegExp(target, 'g')
        return string.valueOf().replace(regex, value)
      }
      await fs.outputFile(
        devHTMLPath,
        replaceAll(devHTML, 'INSERT_OUTPUT_FOLDER_NAME', outputFolder)
      )
    }
    if (!server) {
      server = await createServer(config)
      await server.listen()
    }
    hasCopiedFiles = true
  } else {
    await fs.outputFile(prodHTMLPath, prodHTML)
    await build(config)
  }
  /**
   * Vite alters the value of `process.env.NODE_ENV` on production builds.
   * Set it back to the previous value, and if there wasn't a value, remove
   * it from `process.env`.
   */
  if (!node_env) {
    delete process.env.NODE_ENV
  } else {
    process.env.NODE_ENV = node_env
  }
}

function execShellCommand(cmd: string): Promise<string> {
  const exec = require('child_process').exec
  return new Promise((resolve, reject) => {
    exec(cmd, (error: string, stdout: string, stderr: string) => {
      if (error) {
        reject(error)
      }
      resolve(stdout ? stdout : stderr)
    })
  })
}
