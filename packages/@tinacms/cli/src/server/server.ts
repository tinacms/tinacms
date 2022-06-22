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

import path from 'path'
import cors from 'cors'
import http from 'http'
import express from 'express'
import { altairExpress } from 'altair-express-middleware'
// @ts-ignore
import bodyParser from 'body-parser'
import type { Database } from '@tinacms/graphql'
import { createMediaRouter } from './routes'
import { parseMediaFolder } from '../utils'

export const gqlServer = async (database, verbose: boolean) => {
  // This is lazily required so we can update the module
  // without having to restart the server
  const gqlPackage = require('@tinacms/graphql')

  const app = express()
  const server = http.createServer(app)
  app.use(cors())
  app.use(bodyParser.json())

  app.use(
    '/altair',
    altairExpress({
      endpointURL: '/graphql',
      initialQuery: `# Welcome to Tina!
      # We've got a simple query set up for you to get started
      # but there's plenty more for you to explore on your own!
      query MyQuery {
        collections {
          documents {
            id
            sys {
              filename
              extension
            }
          }
        }
      }`,
    })
  )

  app.post('/graphql', async (req, res) => {
    const { query, variables } = req.body
    const config = {
      useRelativeMedia: true,
    }
    const result = await gqlPackage.resolve({
      config,
      database,
      query,
      variables,
      verbose,
    })
    return res.json(result)
  })

  const db: Database = database
  const schema = await db.getSchema()
  // TODO: fix types
  // @ts-ignore
  const mediaPaths = schema?.schema?.config?.media?.tina || {}

  app.use(
    '/media',
    createMediaRouter({
      publicFolder: parseMediaFolder(mediaPaths?.publicFolder || ''),
      mediaRoot: parseMediaFolder(mediaPaths?.mediaRoot || ''),
    })
  )
  return server
}
