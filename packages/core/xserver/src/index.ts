import { PluginManager, Plugin } from '@forestryio/cms'
const express = require('express')

interface XServerPlugin extends Plugin {
  apply(server: any, config: XServerConfig): void
}

interface XServerConfig {
  routePrefix?: string
  envPrefix?: string
}

export class XServer {
  server: any
  plugins: PluginManager
  config: XServerConfig
  routePrefix: string
  envPrefix: string

  constructor(config: XServerConfig) {
    this.server = express()
    this.plugins = new PluginManager()
    this.config = config
    this.routePrefix = config.routePrefix || '/__xeditor'
    this.envPrefix = config.envPrefix || 'XEDITOR_'

    this.server.get(`${this.routePrefix}`, (_: any, res: any) => res.send("Xserver running"))
  }

  start(port: any = 4567) {
    this.plugins.all('server').map((plugin: any) => plugin.apply(this.server, this.config))
    this.server.listen(port, () => {
      console.log(`\x1b[35m┌─────────────────────────────────────────────┐\x1b[0m`)
      console.log(`\x1b[35m│ Xserver (not that one) running on port ${port} │\x1b[0m`)
      console.log(`\x1b[35m└─────────────────────────────────────────────┘\x1b[0m`)
    })
  }
}
