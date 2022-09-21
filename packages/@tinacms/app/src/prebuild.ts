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
import { build, InlineConfig } from 'vite'
import path from 'path'
import fs from 'fs-extra'
import { viteTina } from './tailwind'

/**
 * Since this package is shipped as an incomplete build of a vite app (we still need
 * the user's config), we pre-build it here, which will bundle all the dependencies as
 * part of the built artifact
 *
 * The viteBuild will then use this output + user's config to build the actual vite app
 */
const prebuild = async () => {
  const outDir = path.join(__dirname, '../dist/bundle')
  const outHTML = path.join(__dirname, '../dist/index.dev.html')
  await fs.copyFileSync(
    path.join(__dirname, '../appFiles/index.dev.html'),
    outHTML
  )
  const entry = path.join(__dirname, '../appFiles/src/main.tsx')
  const libConfig: InlineConfig = {
    plugins: [react(), viteTina()],
    define: {
      // Throws "SyntaxError: Unexpected token" from react-router-dom at `process.env.NODE_ENV` :shrug:
      // 'process.env': {},
      __API_URL__: `__API_URL__`,
    },
    build: {
      minify: false,
      sourcemap: false,
      rollupOptions: {
        external: 'TINA_IMPORT',
      },
      outDir,
      emptyOutDir: false,
      lib: {
        entry,
        formats: ['es'],
        fileName: 'out',
      },
    },
    logLevel: 'silent',
  }
  console.log('building lib')
  await build(libConfig)
}

prebuild()
