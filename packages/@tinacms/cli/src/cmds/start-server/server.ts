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

const gqlServer = async () => {
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
        getCollections {
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

  const rootPath = path.join(process.cwd())
  app.post('/graphql', async (req, res) => {
    const { query, variables } = req.body
    const result = await gqlPackage.gql({
      rootPath,
      query,
      variables,
    })
    return res.json(result)
  })

  return server
}

export default gqlServer
