import { XServer } from '@forestryio/xserver'

interface PluginConfig {
  resolve: string
}

interface PluginOptions {
  routePrefix?: string
  envPrefix?: string
  port?: Number
  plugins?: Array<PluginConfig>
}

exports.onPreBootstrap = (_: any, pluginOptions: PluginOptions) => {
  const xserver = new XServer(pluginOptions)
  if (pluginOptions.plugins && pluginOptions.plugins.length > 0) {
    pluginOptions.plugins.map((pluginConfig: PluginConfig) => {
      let plugin = require(pluginConfig.resolve)
      xserver.extend(plugin.extendXserver as any)
    })
  }
  xserver.start(pluginOptions.port || 4567)
}
