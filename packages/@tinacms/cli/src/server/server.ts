/**

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
  const mediaPaths = schema?.schema?.config?.media?.tina

  app.use(
    '/media',
    createMediaRouter({
      rootPath: db.bridge.rootPath,
      publicFolder: parseMediaFolder(mediaPaths?.publicFolder || ''),
      mediaRoot: parseMediaFolder(mediaPaths?.mediaRoot || ''),
    })
  )

  // We could add this back in if we wanted to level and graphql to be the same server on the same port. We can not add this in right now because the graphql server starts after the database is indexed
  // const levelHost = new ManyLevelHost(
  //   new MemoryLevel<string, Record<string, any>>({
  //     valueEncoding: 'json',
  //   })
  // )
  // // Level TCP server
  // server.on('connection', (socket) => {
  //   pipeline(socket, levelHost.createRpcStream(), socket, () => {
  //     // Disconnected
  //     pipeline(socket, levelHost.createRpcStream(), socket, () => {
  //       // Disconnected
  //       // socket.destroy()
  //     })
  //   })
  // })

  return server
}
