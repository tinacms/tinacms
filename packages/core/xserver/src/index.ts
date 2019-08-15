const express = require('express')
const cors = require('cors')

export interface XServerConfig {
  routePrefix?: string
  envPrefix?: string
}

export type XServerPlugin = (server: XServer, config: XServerConfig) => void

export class XServer {
  server: any
  config: XServerConfig

  constructor(config: XServerConfig) {
    this.server = express()
    this.config = {
      routePrefix: '/x-server',
      envPrefix: 'XEDITOR_',
      ...config,
    }

    this.server.use(
      cors({
        origin: function(origin: any, callback: any) {
          // TODO: Only accept from same host.
          callback(null, true)
        },
      })
    )
    this.server.get(`${this.config.routePrefix}`, (_: any, res: any) =>
      res.send('Xserver running')
    )
  }

  extend(plugin: XServerPlugin) {
    plugin(this.server, this.config)
  }

  start(port: Number = 4567) {
    this.server.listen(port, () => {
      console.log(
        `\x1b[35m┌─────────────────────────────────────────────┐\x1b[0m`
      )
      console.log(
        `\x1b[35m│ Xserver (not that one) running on port ${port} │\x1b[0m`
      )
      console.log(
        `\x1b[35m└─────────────────────────────────────────────┘\x1b[0m`
      )
    })
  }
}
