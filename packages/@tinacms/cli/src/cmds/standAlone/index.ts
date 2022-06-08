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

import { createServer, build as viteBuild, InlineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
const root = path.join(__dirname, '..', 'appFiles')
const isMonoRepo = process.env.TINA_INTERNAL_MONOREPO === 'true'
let config: InlineConfig = {
  root,
  server: {
    force: true,
  },
  resolve: {
    alias: {
      // external
      TINA_IMPORT: path.join(process.cwd(), '.tina', 'schema'),
    },
  },
  build: {
    emptyOutDir: true,
    outDir: path.resolve(process.cwd(), 'out'),
  },
  plugins: [react],
}

if (isMonoRepo) {
  // if we are building in the mono repo resolve locally because PNP does not seem to work with vite
  config = {
    ...config,
    resolve: {
      ...config?.resolve,
      alias: {
        ...config.resolve?.alias,
        /// internal
        'tinacms/dist/edit-state': path.resolve(
          __dirname,
          '../../../tinacms/dist/edit-state.es'
        ),
        tinacms: path.resolve(__dirname, '../../../tinacms/dist/index.es'),
        '@tinacms/toolkit': path.resolve(
          __dirname,
          '../../toolkit/dist/index.es'
        ),
        '@tinacms/sharedctx': path.resolve(
          __dirname,
          '../../sharedctx/dist/index.es'
        ),
        '@tinacms/schema-tools': path.resolve(
          __dirname,
          '../../schema-tools/dist/index.es'
        ),
      },
    },
  }
}

export const createViteServer = async () => {
  // this will have to be updated for prod

  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    ...config,
    server: {
      port: 3000,
    },
  })
  await server.listen()

  server.printUrls()
}
type Awaited<T> = T extends PromiseLike<infer U> ? U : T
type TempUnion = Awaited<ReturnType<typeof viteBuild>>
type TempType = Extract<TempUnion, { output: Array<any> }>
export const buildStandAlone = async () => {
  const out = (await viteBuild(config)) as TempType
}
