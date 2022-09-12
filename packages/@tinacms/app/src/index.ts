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
import { build, InlineConfig } from 'vite'
import path from 'path'

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
    mode: local ? 'development' : 'production',
    plugins: [react()],
    define: {
      'process.env': {},
      __API_URL__: `"${apiUrl}"`,
    },
    server: {
      strictPort: true,
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
  await build(config)
}
