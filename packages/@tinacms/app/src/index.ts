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
import { build as esbuild } from 'esbuild'
import type { Loader } from 'esbuild'

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
  const root = path.resolve(__dirname, '..', 'appFiles')
  const pathToConfig = path.join(rootPath, '.tina', 'config')
  const packageJSONFilePath = path.join(rootPath, 'package.json')
  const outDir = path.join(rootPath, publicFolder, outputFolder)
  await fs.emptyDir(outDir)
  await fs.ensureDir(outDir)
  await fs.writeFile(
    path.join(rootPath, publicFolder, outputFolder, '.gitignore'),
    `index.html
assets/
vite.svg`
  )

  /**
   * This pre-build logic is the same as what we do in packages/@tinacms/cli/src/cmds/compile/index.ts.
   * The logic should be merged, possibly from moving `viteBuild` to a higher-level but for now it's easiest
   * to keep them separate since they run at different times. the compilation step also cleans up after itself
   * so we can't use it as an artifact for this.
   */
  const packageJSON = JSON.parse(
    fs.readFileSync(packageJSONFilePath).toString() || '{}'
  )
  const define = {}
  const deps = packageJSON?.dependencies || []
  const peerDeps = packageJSON?.peerDependencies || []
  const devDeps = packageJSON?.devDependencies || []
  const external = Object.keys({ ...deps, ...peerDeps, ...devDeps })
  const out = path.join(rootPath, '.tina', '__generated__', 'out.jsx')
  await esbuild({
    bundle: true,
    platform: 'browser',
    target: ['es2020'],
    entryPoints: [pathToConfig],
    format: 'esm',
    treeShaking: true,
    outfile: out,
    external: [...external, './node_modules/*'],
    loader: loaders,
    define: define,
  })

  const base = `/${outputFolder}/`
  const config: InlineConfig = {
    root,
    base,
    // For some reason this is breaking the React runtime in the end user's application.
    // Not sure what's going on but `development` works for now.
    mode: local ? 'development' : 'production',
    plugins: [react(), viteTina()],
    define: {
      'process.env': {},
      __API_URL__: `"${apiUrl}"`,
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
        TINA_IMPORT: out,
      },
    },
    build: {
      sourcemap: true,
      outDir,
      emptyOutDir: false,
    },
    logLevel: 'silent',
  }
  if (true) {
    await build(config)
    await fs.rmSync(out)
  } else {
    /**
     * Uncomment to run the dev server
     * Note that this assumes the outputFile is 'admin'
     * And will run into port issues when the build server
     * restart itself
     */
    const indexDev = await fs
      .readFileSync(path.join(root, 'index.dev.html'))
      .toString()
    await fs.writeFileSync(path.join(outDir, 'index.html'), indexDev)
    const server = await createServer(config)
    await server.listen()
    await server.printUrls()
  }
}

const loaders: { [ext: string]: Loader } = {
  '.aac': 'file',
  '.css': 'file',
  '.eot': 'file',
  '.flac': 'file',
  '.gif': 'file',
  '.jpeg': 'file',
  '.jpg': 'file',
  '.json': 'json',
  '.mp3': 'file',
  '.mp4': 'file',
  '.ogg': 'file',
  '.otf': 'file',
  '.png': 'file',
  '.svg': 'file',
  '.ttf': 'file',
  '.wav': 'file',
  '.webm': 'file',
  '.webp': 'file',
  '.woff': 'file',
  '.woff2': 'file',
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.tsx': 'tsx',
}
