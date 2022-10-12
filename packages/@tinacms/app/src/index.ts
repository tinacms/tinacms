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
import { build, createServer } from 'vite'
import type { InlineConfig, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { viteTina } from './tailwind'
import { devHTML, prodHTML } from './html'

let server: ViteDevServer

export const viteBuild = async ({
  rootPath,
  outputFolder,
  publicFolder,
  local,
  apiUrl,
}: {
  local: boolean
  rootPath: string
  publicFolder: string
  outputFolder: string
  apiUrl: string
}) => {
  const generatedPath = path.join(rootPath, '.tina/__generated__')
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
        external: ['react', 'react-dom', 'tinacms'],
      },
    },
    logLevel: 'silent',
  }
  await build(prebuildConfig)

  const alias = {
    TINA_IMPORT: configPrebuildPath,
  }

  const config: InlineConfig = {
    root: appRootPath,
    base: `/${outputFolder}/`,
    mode: local ? 'development' : 'production',
    plugins: [react(), viteTina()],
    define: {
      // Not sure this is needed anymore, but does seem like
      // somewhere `process.env.NODE_ENV` is getting populated
      // Maybe some context? https://github.com/vitejs/vite/pull/8090#issuecomment-1184929037
      'process.env': {},
      __API_URL__: `"${apiUrl}"`,
    },
    server: {
      port: 5173,
      fs: {
        strict: false,
      },
    },
    resolve: {
      alias,
    },
    build: {
      sourcemap: true,
      outDir: outputPath,
      emptyOutDir: false,
    },
    logLevel: 'silent',
  }
  if (true) {
    await fs.copy(appCopyPath, appRootPath)
  } else {
    await fs.createSymlink(
      path.join(appCopyPath, 'src'),
      path.join(appRootPath, 'src'),
      'dir'
    )
    await fs.createSymlink(
      path.join(appCopyPath, 'package.json'),
      path.join(appRootPath, 'package.json'),
      'file'
    )
  }

  await execShellCommand(
    `npm --prefix ${appRootPath} i --legacy-peer-deps --omit=dev --no-package-lock`
  )
  await fs.outputFile(
    path.join(outputPath, '.gitignore'),
    `index.html
assets/`
  )
  if (local) {
    await fs.outputFile(
      devHTMLPath,
      devHTML.replaceAll('INSERT_OUTPUT_FOLDER_NAME', outputFolder)
    )
    if (server) {
      await server.close()
    }
    server = await createServer(config)
    await server.listen()
  } else {
    await fs.outputFile(prodHTMLPath, prodHTML)
    await build(config)
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
