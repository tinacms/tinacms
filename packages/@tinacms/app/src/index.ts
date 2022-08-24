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

import react from '@vitejs/plugin-react'
import fs from 'fs-extra'
import { build, createServer, InlineConfig } from 'vite'
import path from 'path'
import { viteTina } from './tailwind'

export const viteBuild = async ({
  rootPath,
  watch,
  outputFolder,
  publicFolder,
  local,
}: {
  local: boolean
  watch: boolean
  rootPath: string
  publicFolder: string
  outputFolder: string
}) => {
  const root = path.resolve(__dirname, '..', 'appFiles')
  const pathToConfig = path.join(rootPath, '.tina', 'config')
  const outDir = path.join(rootPath, publicFolder, outputFolder)
  await fs.emptyDir(outDir)
  await fs.ensureDir(outDir)
  await fs.writeFile(
    path.join(rootPath, publicFolder, outputFolder, '.gitignore'),
    `index.html
assets/
vite.svg`
  )

  const base = `/${outputFolder}/`
  const config: InlineConfig = {
    root,
    base,
    // For some reason this is breaking the React runtime in the end user's application.
    // Not sure what's going on but `development` works for now.
    // mode: watch ? 'development' : 'production',
    mode: 'development',
    plugins: [react(), viteTina()],
    define: {
      'process.env': {},
    },
    server: {
      strictPort: true,
      port: 5173,
      fs: {
        // allow isn't working yet, so be lax with it (maybe just do this for dev mode)
        strict: false,
        // /**
        //  * From the monorepo Vite is importing from a node_modules folder relative to itself, which
        //  * works as expected. But when published and used from a yarn setup, the node_modules
        //  * are flattened, meaning we need to access the global node_modules folder instead of
        //  * our own. I believe this is fine, but something to keep an eye on.
        //  */
        // allow: ['..'],
      },
    },
    resolve: {
      alias: {
        TINA_IMPORT: pathToConfig,
      },
    },
    build: {
      sourcemap: true,
      outDir,
      emptyOutDir: false,
    },
    logLevel: 'silent',
  }
  if (watch) {
    const indexDev = await fs
      .readFileSync(path.join(root, 'index.dev.html'))
      .toString()
    await fs.writeFileSync(path.join(outDir, 'index.html'), indexDev)
    const server = await createServer(config)
    await server.listen()
    await server.printUrls()
  } else {
    await build(config)
  }
}
